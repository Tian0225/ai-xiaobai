/**
 * 支付对账适配层
 *
 * 直接查询 Supabase orders 表来检测支付状态（绕过 XPay 后端）
 */

export type PaymentMethod = 'wechat' | 'alipay'

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
    console.log(`Supabase: 检测订单 ${orderId}，金额 ¥${amount}，方式 ${paymentMethod}`)

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
