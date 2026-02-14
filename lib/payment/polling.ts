/**
 * 支付对账适配层
 *
 * 直接查询 Supabase orders 表来检测支付状态（绕过 XPay 后端）
 */

import type { SupabaseClient } from '@supabase/supabase-js'

export type PaymentMethod = 'wechat' | 'alipay'

export interface Transaction {
  id: string
  amount: number
  remark: string
  createdAt: string
  type: PaymentMethod
  status: string
}

function toSafeString(value: unknown): string {
  if (value == null) return ''
  return String(value).trim()
}

function toISODate(value: unknown): string {
  const raw = toSafeString(value)
  if (!raw) return new Date().toISOString()
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return new Date().toISOString()
  return date.toISOString()
}

function toAmountYuan(value: unknown, fenValue: unknown): number {
  const fenRaw = toSafeString(fenValue)
  if (fenRaw) {
    const fen = Number(fenRaw)
    if (Number.isFinite(fen)) {
      return fen / 100
    }
  }

  const raw = toSafeString(value)
  if (!raw) return 0
  const amount = Number(raw)
  if (!Number.isFinite(amount)) return 0
  return amount
}

function normalizeStatus(raw: unknown) {
  const status = toSafeString(raw).toUpperCase()
  return status || 'UNKNOWN'
}

function normalizeTransaction(raw: Record<string, unknown>, method: PaymentMethod): Transaction | null {
  const id = toSafeString(
    raw.id ?? raw.transactionId ?? raw.transaction_id ?? raw.trade_no ?? raw.out_trade_no
  )

  if (!id) return null

  const remark = toSafeString(raw.remark ?? raw.attach ?? raw.memo ?? raw.body ?? raw.note)
  const createdAt = toISODate(
    raw.createdAt ??
      raw.created_at ??
      raw.payTime ??
      raw.pay_time ??
      raw.success_time ??
      raw.gmt_payment
  )
  const amount = toAmountYuan(
    raw.amount ?? raw.total_amount ?? raw.pay_amount ?? raw.totalFee,
    raw.amount_fen ?? raw.amountFen ?? raw.total_fee ?? raw.cash_fee
  )
  const status = normalizeStatus(raw.status ?? raw.trade_status ?? raw.state ?? raw.tradeState)

  return {
    id,
    amount,
    remark,
    createdAt,
    type: method,
    status,
  }
}

function isMatchedOrder(transaction: Transaction, orderId: string, amount: number) {
  const SUCCESS_STATUSES = new Set(['SUCCESS', 'PAY_SUCCESS', 'TRADE_SUCCESS', 'TRADE_FINISHED', '1'])
  return (
    transaction.remark.includes(orderId) &&
    transaction.amount >= amount &&
    SUCCESS_STATUSES.has(transaction.status)
  )
}

/**
 * 直接查 Supabase orders 表检测支付状态
 */
export async function checkPaymentStatus(
  orderId: string,
  amount: number,
  paymentMethod: PaymentMethod
): Promise<boolean> {
  // 使用 service role key 获取完整权限
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase 环境变量未配置')
  }

  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(supabaseUrl, supabaseKey)

  if (!supabase) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY 未配置')
  }

  try {
    // 查询订单状态
    const { data: order, error } = await supabase
      .from('orders')
      .select('status, paid_at,created_at')
      .eq('order_id', orderId)
      .maybeSingle()

    if (error || !order) {
      console.log(`Supabase: 订单 ${orderId} 不存在`)
      return false
    }

    if (order.status === 'paid') {
      console.log(`Supabase: 订单 ${orderId} 已支付`)
      return true
    }

    // 检查是否过期（超过20分钟未支付）
    const expiresAt = new Date(order.created_at || Date.now())
    const now = new Date()
    const minutesSinceCreation = (now.getTime() - expiresAt.getTime()) / 60000

    if (minutesSinceCreation > 20) {
      console.log(`Supabase: 订单 ${orderId} 已过期（${Math.floor(minutesSinceCreation)} 分钟）`)
      // 更新为过期状态
      await supabase
        .from('orders')
        .update({ status: 'expired' })
        .eq('order_id', orderId)
        .eq('status', 'pending')
      return false
    }

    return false
  } catch (error) {
    console.error('Supabase 查询订单失败:', error)
    return false
  }
}
