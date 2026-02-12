import type { NextRequest } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'

export type AdminOperationAction =
  | 'member_activate'
  | 'member_revoke'
  | 'member_restore'
  | 'order_verify'

interface LogContext {
  targetUserId?: string
  targetUserEmail?: string
  targetOrderId?: string
  result: 'success' | 'failed'
  detail?: Record<string, unknown>
}

export function getRequestMeta(request: NextRequest) {
  const rawForwardedFor = request.headers.get('x-forwarded-for') ?? ''
  const operatorIp = rawForwardedFor.split(',')[0]?.trim() || request.headers.get('x-real-ip') || null
  const operatorUserAgent = request.headers.get('user-agent') || null

  return {
    operatorIp,
    operatorUserAgent,
  }
}

export async function writeAdminOperationLog(
  adminClient: SupabaseClient,
  request: NextRequest,
  actorEmail: string,
  action: AdminOperationAction,
  context: LogContext
) {
  const { operatorIp, operatorUserAgent } = getRequestMeta(request)

  const { error } = await adminClient.from('admin_operation_logs').insert({
    actor_email: actorEmail,
    action,
    target_user_id: context.targetUserId ?? null,
    target_user_email: context.targetUserEmail ?? null,
    target_order_id: context.targetOrderId ?? null,
    result: context.result,
    detail: context.detail ?? {},
    operator_ip: operatorIp,
    operator_user_agent: operatorUserAgent,
  })

  if (error) {
    console.error('写入后台操作日志失败:', error)
  }
}
