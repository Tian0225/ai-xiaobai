import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { orderId, amount, userEmail, paymentMethod } = await request.json()

    // 验证参数
    if (!orderId || !amount || !userEmail || !paymentMethod) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    const supabase = await createClient()

    // 获取当前用户
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    // 创建订单记录
    const { data, error } = await supabase
      .from('orders')
      .insert({
        order_id: orderId,
        user_id: user.id,
        user_email: userEmail,
        amount,
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
