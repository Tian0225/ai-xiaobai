import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminEmail } from '@/lib/auth/admin'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const PAYMENT_VERIFY_TOKEN = process.env.PAYMENT_VERIFY_TOKEN

async function verifyCallerPermission(request: NextRequest) {
  const authHeader = request.headers.get('x-payment-verify-token')

  if (PAYMENT_VERIFY_TOKEN && authHeader === PAYMENT_VERIFY_TOKEN) {
    return { ok: true as const }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      ok: false as const,
      status: 401,
      error: '请先登录',
    }
  }

  if (!isAdminEmail(user.email)) {
    return {
      ok: false as const,
      status: 403,
      error: '无权限调用验证接口',
    }
  }

  return { ok: true as const }
}

// 支持两种调用方式：
// 1. 管理员后台登录后人工确认
// 2. 携带 x-payment-verify-token 的服务端调用
export async function POST(request: NextRequest) {
  try {
    const permission = await verifyCallerPermission(request)
    if (!permission.ok) {
      return NextResponse.json({ error: permission.error }, { status: permission.status })
    }

    const body = await request.json()
    const orderId = typeof body.orderId === 'string' ? body.orderId.trim() : ''
    const transactionId =
      typeof body.transactionId === 'string' ? body.transactionId.trim() : ''

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
        transaction_id: transactionId || `MANUAL_${Date.now()}_${orderId}`,
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
