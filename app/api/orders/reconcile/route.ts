import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkPaymentStatus } from '@/lib/payment/polling'
import type { Database } from '@/lib/database.types'
import { fulfillPaidOrder } from '@/lib/order-fulfillment'
import { hasOrderExpired } from '@/lib/order-state'

const ORDER_RECONCILE_TOKEN = process.env.ORDER_RECONCILE_TOKEN
const CRON_SECRET = process.env.CRON_SECRET
const RECONCILE_BATCH_SIZE = 50

type PendingOrder = Pick<
  Database['public']['Tables']['orders']['Row'],
  'order_id' | 'user_id' | 'user_email' | 'amount' | 'payment_method' | 'status' | 'expires_at'
>

function isAuthorized(request: NextRequest) {
  const authorization = request.headers.get('authorization')
  if (CRON_SECRET && authorization === `Bearer ${CRON_SECRET}`) {
    return true
  }

  const manualToken = request.headers.get('x-order-reconcile-token')
  if (ORDER_RECONCILE_TOKEN && manualToken === ORDER_RECONCILE_TOKEN) {
    return true
  }

  return false
}

async function reconcileOrders(request: NextRequest) {
  if (!CRON_SECRET && !ORDER_RECONCILE_TOKEN) {
    return NextResponse.json(
      { error: 'CRON_SECRET 或 ORDER_RECONCILE_TOKEN 至少配置一个' },
      { status: 503 }
    )
  }

  if (!isAuthorized(request)) {
    return NextResponse.json({ error: '无权限执行对账任务' }, { status: 401 })
  }

  try {
    const supabase = createAdminClient()
    const now = new Date()

    const { data: orders, error: queryError } = await supabase
      .from('orders')
      .select('order_id, user_id, user_email, amount, payment_method, status, expires_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(RECONCILE_BATCH_SIZE)

    if (queryError) {
      console.error('查询待支付订单失败:', queryError)
      return NextResponse.json({ error: '查询待支付订单失败' }, { status: 500 })
    }

    const pendingOrders = (orders ?? []) as PendingOrder[]
    let paidCount = 0
    let expiredCount = 0
    let scannedCount = 0
    let idempotentCount = 0
    const failedOrders: string[] = []

    for (const order of pendingOrders) {
      scannedCount += 1

      if (hasOrderExpired(order.expires_at, now)) {
        const { error } = await supabase
          .from('orders')
          .update({ status: 'expired' })
          .eq('order_id', order.order_id)
          .eq('status', 'pending')

        if (error) {
          failedOrders.push(order.order_id)
          console.error('订单过期状态更新失败:', order.order_id, error)
        } else {
          expiredCount += 1
        }
        continue
      }

      try {
        const isPaid = await checkPaymentStatus(
          order.order_id,
          Number(order.amount),
          order.payment_method
        )

        if (!isPaid) continue

        const transactionId = `AUTO_${Date.now()}_${order.order_id}`
        const result = await fulfillPaidOrder(supabase, {
          orderId: order.order_id,
          transactionId,
          paidAtIso: new Date().toISOString(),
        })

        if (!result.success) {
          failedOrders.push(order.order_id)
          console.error('自动发货失败:', order.order_id, result.error)
          continue
        }

        if (result.idempotent) {
          idempotentCount += 1
        } else {
          paidCount += 1
        }
      } catch (error) {
        failedOrders.push(order.order_id)
        console.error('订单对账异常:', order.order_id, error)
      }
    }

    return NextResponse.json({
      success: true,
      scannedCount,
      paidCount,
      expiredCount,
      idempotentCount,
      failedCount: failedOrders.length,
      failedOrders,
      executedAt: now.toISOString(),
    })
  } catch (error) {
    console.error('订单对账任务失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

/**
 * 定时对账接口（建议由外部调度器调用，如 GitHub Actions）。
 *
 * GET: 外部调度（Authorization: Bearer ${CRON_SECRET}）
 * POST: 手动触发（x-order-reconcile-token）
 */
export async function GET(request: NextRequest) {
  return reconcileOrders(request)
}

export async function POST(request: NextRequest) {
  return reconcileOrders(request)
}
