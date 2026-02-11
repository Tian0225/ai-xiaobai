import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

const PAYMENT_VERIFY_TOKEN = process.env.PAYMENT_VERIFY_TOKEN

// 这个 API 用于手动验证支付或者由支付平台的 webhook 调用
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('x-payment-verify-token')
    if (!PAYMENT_VERIFY_TOKEN) {
      return NextResponse.json({ error: 'PAYMENT_VERIFY_TOKEN 未配置' }, { status: 503 })
    }
    if (!authHeader || authHeader !== PAYMENT_VERIFY_TOKEN) {
      return NextResponse.json({ error: '无权限调用验证接口' }, { status: 401 })
    }

    const { orderId, transactionId } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: '缺少订单号' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // 查询订单
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: '订单不存在' }, { status: 404 })
    }

    // 检查订单是否已经处理过
    if (order.status === 'paid') {
      return NextResponse.json({ success: true, message: '订单已支付' })
    }
    if (order.status !== 'pending') {
      return NextResponse.json({ error: `订单状态不可验证: ${order.status}` }, { status: 400 })
    }

    // 更新订单状态
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'paid',
        transaction_id: transactionId,
        paid_at: new Date().toISOString(),
      })
      .eq('order_id', orderId)

    if (updateError) {
      console.error('更新订单状态失败:', updateError)
      return NextResponse.json({ error: '更新订单失败' }, { status: 500 })
    }

    // 开通会员权限
    const membershipExpiresAt = new Date()
    membershipExpiresAt.setFullYear(membershipExpiresAt.getFullYear() + 1) // 1年后过期

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        is_member: true,
        membership_expires_at: membershipExpiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.user_id)

    if (profileError) {
      console.error('开通会员失败:', profileError)
      // 即使开通会员失败，订单也已标记为已支付，需要人工处理
      return NextResponse.json({
        error: '开通会员失败，请联系客服',
        orderId
      }, { status: 500 })
    }

    // TODO: 发送确认邮件
    // await sendConfirmationEmail(order.user_email, orderId)

    return NextResponse.json({
      success: true,
      message: '支付成功，会员已开通',
      membershipExpiresAt: membershipExpiresAt.toISOString()
    })
  } catch (error) {
    console.error('验证支付错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
