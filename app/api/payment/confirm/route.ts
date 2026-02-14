import { createClient } from '@/lib/supabase/client'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const confirmSchema = z.object({
  orderId: z.string().min(1, '订单号不能为空'),
  amount: z.number().min(0.01, '金额必须大于0'),
  paymentMethod: z.enum(['wechat', 'alipay']),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const result = confirmSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: '参数验证失败', details: result.error.format() },
        { status: 400 }
      )
    }

    const { orderId, amount, paymentMethod } = result.data

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    if (!user.email) {
      return NextResponse.json({ error: '用户邮箱缺失' }, { status: 400 })
    }

    // 检查订单是否已存在
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('order_id')
      .eq('order_id', orderId)
      .maybeSingle()

    if (existingOrder) {
      return NextResponse.json({ error: '订单号已存在，请勿重复提交' }, { status: 409 })
    }

    // 创建新订单（状态为 pending）
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 20 * 60 * 1000) // 20分钟后过期

    const { data: newOrder, error } = await supabase
      .from('orders')
      .insert({
        order_id: orderId,
        user_id: user.id,
        user_email: user.email,
        amount,
        payment_method: paymentMethod,
        status: 'pending',
        created_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      })
      .select('order_id, user_id, user_email, amount, status, created_at, expires_at')
      .single()

    if (error || !newOrder) {
      console.error('创建订单失败:', error)
      return NextResponse.json({ error: '创建订单失败，请稍后重试' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      order: newOrder,
      message: '订单已创建，系统正在检测支付状态...',
    })
  } catch (error) {
    console.error('支付确认错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
