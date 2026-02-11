import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkPaymentStatus } from '@/lib/payment/polling'
import type { Database } from '@/lib/database.types'

const ORDER_RECONCILE_TOKEN = process.env.ORDER_RECONCILE_TOKEN
const RECONCILE_BATCH_SIZE = 50

type PendingOrder = Pick<
  Database['public']['Tables']['orders']['Row'],
  'order_id' | 'user_id' | 'amount' | 'payment_method' | 'status' | 'expires_at'
>

/**
 * 定时对账接口（建议由 Vercel Cron 调用）。
 *
 * 流程：
 * 1) 拉取待支付订单
 * 2) 过期订单标记 expired
 * 3) 调用支付轮询能力检查到账记录
 * 4) 到账后开通会员
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('x-order-reconcile-token')
    if (!ORDER_RECONCILE_TOKEN) {
      return NextResponse.json({ error: 'ORDER_RECONCILE_TOKEN 未配置' }, { status: 503 })
    }
    if (!authHeader || authHeader !== ORDER_RECONCILE_TOKEN) {
      return NextResponse.json({ error: '无权限执行对账任务' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const now = new Date()

    const { data: orders, error: queryError } = await supabase
      .from('orders')
      .select('order_id, user_id, amount, payment_method, status, expires_at')
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
    const failedOrders: string[] = []

    for (const order of pendingOrders) {
      scannedCount += 1
      const expiresAt = new Date(order.expires_at)

      if (expiresAt <= now) {
        const { error } = await supabase
          .from('orders')
          .update({ status: 'expired' })
          .eq('order_id', order.order_id)

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

        const paidAt = new Date().toISOString()
        const transactionId = `AUTO_${Date.now()}_${order.order_id}`
        const membershipExpiresAt = new Date()
        membershipExpiresAt.setFullYear(membershipExpiresAt.getFullYear() + 1)

        const { error: orderUpdateError } = await supabase
          .from('orders')
          .update({
            status: 'paid',
            transaction_id: transactionId,
            paid_at: paidAt,
          })
          .eq('order_id', order.order_id)
          .eq('status', 'pending')

        if (orderUpdateError) {
          failedOrders.push(order.order_id)
          console.error('订单支付状态更新失败:', order.order_id, orderUpdateError)
          continue
        }

        const { error: profileUpdateError } = await supabase
          .from('profiles')
          .update({
            is_member: true,
            membership_expires_at: membershipExpiresAt.toISOString(),
            updated_at: paidAt,
          })
          .eq('id', order.user_id)

        if (profileUpdateError) {
          failedOrders.push(order.order_id)
          console.error('会员开通失败:', order.order_id, profileUpdateError)
          continue
        }

        paidCount += 1
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
      failedCount: failedOrders.length,
      failedOrders,
    })
  } catch (error) {
    console.error('订单对账任务失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
