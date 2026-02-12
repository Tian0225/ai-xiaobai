import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { hasActiveMembership } from '@/lib/membership'
import { hasOrderExpired } from '@/lib/order-state'

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
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401, headers: noStoreHeaders() })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_member, membership_expires_at')
      .eq('id', user.id)
      .maybeSingle()

    const isMember = hasActiveMembership(profile)

    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', orderId)
      .eq('user_id', user.id)
      .single()

    if (error || !order) {
      return NextResponse.json({ paid: false, isMember, status: 'not_found' }, { headers: noStoreHeaders() })
    }

    if (order.status === 'paid') {
      return NextResponse.json(
        {
          paid: true,
          isMember,
          orderId: order.order_id,
          status: order.status,
          paidAt: order.paid_at,
        },
        { headers: noStoreHeaders() }
      )
    }

    if (order.status === 'pending' && hasOrderExpired(order.expires_at)) {
      await supabase
        .from('orders')
        .update({ status: 'expired' })
        .eq('order_id', orderId)
        .eq('status', 'pending')

      return NextResponse.json(
        {
          paid: false,
          expired: true,
          isMember,
          orderId: order.order_id,
          status: 'expired',
          expiresAt: order.expires_at,
        },
        { headers: noStoreHeaders() }
      )
    }

    return NextResponse.json(
      {
        paid: false,
        isMember,
        orderId: order.order_id,
        status: order.status,
        expiresAt: order.expires_at,
      },
      { headers: noStoreHeaders() }
    )
  } catch (error) {
    console.error('检查订单错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500, headers: noStoreHeaders() })
  }
}
