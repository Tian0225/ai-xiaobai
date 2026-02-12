import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth/require-admin'

const ORDER_FETCH_LIMIT = 120

function noStoreHeaders() {
  return { 'Cache-Control': 'no-store' }
}

export async function GET() {
  try {
    const permission = await requireAdmin()
    if (!permission.ok) {
      return NextResponse.json({ error: permission.error }, { status: permission.status, headers: noStoreHeaders() })
    }

    const adminClient = createAdminClient()
    const { data: orders, error } = await adminClient
      .from('orders')
      .select(
        'order_id, user_id, user_email, amount, payment_method, status, transaction_id, created_at, paid_at, expires_at'
      )
      .order('created_at', { ascending: false })
      .limit(ORDER_FETCH_LIMIT)

    if (error) {
      console.error('查询后台订单失败:', error)
      return NextResponse.json({ error: '查询订单失败' }, { status: 500, headers: noStoreHeaders() })
    }

    const userIds = Array.from(new Set((orders ?? []).map((order) => order.user_id)))
    const memberStatusByUserId = new Map<string, { is_member: boolean; membership_expires_at: string | null }>()

    if (userIds.length > 0) {
      const { data: profiles, error: profileError } = await adminClient
        .from('profiles')
        .select('id, is_member, membership_expires_at')
        .in('id', userIds)

      if (profileError) {
        console.error('查询会员状态失败:', profileError)
      } else {
        for (const profile of profiles ?? []) {
          memberStatusByUserId.set(profile.id, {
            is_member: profile.is_member,
            membership_expires_at: profile.membership_expires_at,
          })
        }
      }
    }

    const normalizedOrders = (orders ?? []).map((order) => {
      const memberStatus = memberStatusByUserId.get(order.user_id)
      return {
        ...order,
        is_member: memberStatus?.is_member ?? false,
        membership_expires_at: memberStatus?.membership_expires_at ?? null,
      }
    })

    return NextResponse.json({
      orders: normalizedOrders,
      fetchedAt: new Date().toISOString(),
    }, { headers: noStoreHeaders() })
  } catch (error) {
    console.error('后台订单接口异常:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500, headers: noStoreHeaders() })
  }
}
