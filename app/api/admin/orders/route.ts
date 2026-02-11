import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminEmail } from '@/lib/auth/admin'

const ORDER_FETCH_LIMIT = 120

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    if (!isAdminEmail(user.email)) {
      return NextResponse.json({ error: '无权限访问后台订单' }, { status: 403 })
    }

    const adminClient = createAdminClient()
    const { data: orders, error } = await adminClient
      .from('orders')
      .select(
        'order_id, user_email, amount, payment_method, status, transaction_id, created_at, paid_at, expires_at'
      )
      .order('created_at', { ascending: false })
      .limit(ORDER_FETCH_LIMIT)

    if (error) {
      console.error('查询后台订单失败:', error)
      return NextResponse.json({ error: '查询订单失败' }, { status: 500 })
    }

    return NextResponse.json({
      orders: orders ?? [],
      fetchedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('后台订单接口异常:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
