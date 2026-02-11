import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function noStoreHeaders() {
  return { 'Cache-Control': 'no-store' }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json({ error: '缺少订单号' }, { status: 400, headers: noStoreHeaders() })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401, headers: noStoreHeaders() })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_member, membership_expires_at')
      .eq('id', user.id)
      .maybeSingle()

    const isMember = Boolean(profile?.is_member)

    // 查询订单状态
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', orderId)
      .eq('user_id', user.id)
      .single()

    if (error || !order) {
      return NextResponse.json({ paid: false, isMember }, { headers: noStoreHeaders() })
    }

    // 检查订单是否已支付
    if (order.status === 'paid') {
      return NextResponse.json({ paid: true, isMember: true, order }, { headers: noStoreHeaders() })
    }

    // 检查订单是否过期
    if (new Date(order.expires_at) < new Date()) {
      // 更新订单状态为已过期
      await supabase
        .from('orders')
        .update({ status: 'expired' })
        .eq('order_id', orderId)

      return NextResponse.json({ paid: false, expired: true, isMember }, { headers: noStoreHeaders() })
    }

    // 这里应该调用微信/支付宝的账单API检查支付状态
    // 由于是模拟，我们先返回未支付状态
    // 实际生产环境需要集成真实的支付API

    return NextResponse.json({
      paid: false,
      isMember,
      orderId: order.order_id,
      status: order.status,
      expiresAt: order.expires_at,
    }, { headers: noStoreHeaders() })
  } catch (error) {
    console.error('检查订单错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500, headers: noStoreHeaders() })
  }
}
