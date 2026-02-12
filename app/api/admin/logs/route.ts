import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth/require-admin'

const LOG_FETCH_LIMIT = 80

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
    const { data: logs, error } = await adminClient
      .from('admin_operation_logs')
      .select(
        'id, actor_email, action, target_user_id, target_user_email, target_order_id, result, detail, operator_ip, operator_user_agent, created_at'
      )
      .order('created_at', { ascending: false })
      .limit(LOG_FETCH_LIMIT)

    if (error) {
      console.error('查询后台日志失败:', error)
      return NextResponse.json({ error: '读取操作日志失败' }, { status: 500, headers: noStoreHeaders() })
    }

    return NextResponse.json(
      {
        logs: logs ?? [],
        fetchedAt: new Date().toISOString(),
      },
      { headers: noStoreHeaders() }
    )
  } catch (error) {
    console.error('后台日志接口异常:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500, headers: noStoreHeaders() })
  }
}
