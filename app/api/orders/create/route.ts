import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const MEMBERSHIP_PRICE = Number(process.env.NEXT_PUBLIC_MEMBERSHIP_PRICE ?? 499)
const PAYMENT_METHODS = ['wechat', 'alipay'] as const
type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const orderId = typeof body.orderId === 'string' ? body.orderId.trim() : ''
    const paymentMethod = body.paymentMethod as PaymentMethod

    // 验证参数
    if (!orderId || !paymentMethod) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }
    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      return NextResponse.json({ error: '支付方式无效' }, { status: 400 })
    }
    if (!Number.isFinite(MEMBERSHIP_PRICE) || MEMBERSHIP_PRICE <= 0) {
      return NextResponse.json({ error: '会员价格配置错误' }, { status: 500 })
    }

    const supabase = await createClient()

    // 获取当前用户
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }
    if (!user.email) {
      return NextResponse.json({ error: '用户邮箱缺失' }, { status: 400 })
    }

    // 创建订单记录
    const { data, error } = await supabase
      .from('orders')
      .insert({
        order_id: orderId,
        user_id: user.id,
        user_email: user.email,
        amount: MEMBERSHIP_PRICE,
        payment_method: paymentMethod,
        status: 'pending',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10分钟后过期
      })
      .select()
      .single()

    if (error) {
      console.error('创建订单失败:', error)
      return NextResponse.json({ error: '创建订单失败' }, { status: 500 })
    }

    return NextResponse.json({ success: true, order: data })
  } catch (error) {
    console.error('订单创建错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
