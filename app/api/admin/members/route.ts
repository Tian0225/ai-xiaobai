import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { calculateMembershipExpiresAt } from '@/lib/order-state'
import { requireAdmin } from '@/lib/auth/require-admin'
import { writeAdminOperationLog } from '@/lib/admin-operation-log'
import type { AdminOperationAction } from '@/lib/admin-operation-log'

type MemberAction = 'activate' | 'revoke' | 'restore'

function noStoreHeaders() {
  return { 'Cache-Control': 'no-store' }
}

function normalizeText(input: unknown) {
  return typeof input === 'string' ? input.trim() : ''
}

function toLogAction(action: MemberAction): AdminOperationAction {
  if (action === 'activate') return 'member_activate'
  if (action === 'revoke') return 'member_revoke'
  return 'member_restore'
}

export async function PATCH(request: NextRequest) {
  const permission = await requireAdmin()
  if (!permission.ok) {
    return NextResponse.json(
      { error: permission.error },
      { status: permission.status, headers: noStoreHeaders() }
    )
  }

  try {
    const body = await request.json()
    const userId = normalizeText(body.userId)
    const userEmail = normalizeText(body.userEmail)
    const action = body.action as MemberAction
    const note = normalizeText(body.note).slice(0, 280)

    if (!userId || !userEmail || !['activate', 'revoke', 'restore'].includes(action)) {
      return NextResponse.json(
        { error: '参数错误' },
        { status: 400, headers: noStoreHeaders() }
      )
    }
    const logAction = toLogAction(action)

    const adminClient = createAdminClient()
    const nowIso = new Date().toISOString()

    const { data: profileBefore, error: profileBeforeError } = await adminClient
      .from('profiles')
      .select('is_member, membership_expires_at')
      .eq('id', userId)
      .maybeSingle()

    if (profileBeforeError) {
      console.error('查询会员状态失败:', profileBeforeError)
      return NextResponse.json(
        { error: '读取会员信息失败' },
        { status: 500, headers: noStoreHeaders() }
      )
    }

    let nextIsMember = profileBefore?.is_member ?? false
    let nextMembershipExpiresAt = profileBefore?.membership_expires_at ?? null

    if (action === 'revoke') {
      nextIsMember = false
      nextMembershipExpiresAt = null
    }

    if (action === 'activate') {
      nextIsMember = true
      nextMembershipExpiresAt = calculateMembershipExpiresAt(profileBefore?.membership_expires_at, nowIso)
    }

    if (action === 'restore') {
      const { data: latestRevokeLog, error: revokeLogError } = await adminClient
        .from('admin_operation_logs')
        .select('detail')
        .eq('action', 'member_revoke')
        .eq('target_user_id', userId)
        .eq('result', 'success')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (revokeLogError) {
        console.error('读取撤销日志失败:', revokeLogError)
      }

      const revokedExpiresAt =
        typeof latestRevokeLog?.detail === 'object' &&
        latestRevokeLog.detail &&
        'beforeMembershipExpiresAt' in latestRevokeLog.detail
          ? (latestRevokeLog.detail.beforeMembershipExpiresAt as string | null)
          : null

      nextIsMember = true
      nextMembershipExpiresAt = revokedExpiresAt
      if (!nextMembershipExpiresAt) {
        nextMembershipExpiresAt = calculateMembershipExpiresAt(profileBefore?.membership_expires_at, nowIso)
      }
    }

    const { data: updatedProfile, error: updateError } = await adminClient
      .from('profiles')
      .upsert({
        id: userId,
        email: userEmail,
        is_member: nextIsMember,
        membership_expires_at: nextMembershipExpiresAt,
        updated_at: nowIso,
      })
      .select('id, is_member, membership_expires_at')
      .single()

    if (updateError) {
      console.error('更新会员状态失败:', updateError)
      await writeAdminOperationLog(adminClient, request, permission.email, logAction, {
        targetUserId: userId,
        targetUserEmail: userEmail,
        result: 'failed',
        detail: {
          note,
          reason: updateError.message,
          beforeIsMember: profileBefore?.is_member ?? null,
          beforeMembershipExpiresAt: profileBefore?.membership_expires_at ?? null,
        },
      })
      return NextResponse.json(
        { error: '更新会员状态失败' },
        { status: 500, headers: noStoreHeaders() }
      )
    }

    await writeAdminOperationLog(adminClient, request, permission.email, logAction, {
      targetUserId: userId,
      targetUserEmail: userEmail,
      result: 'success',
      detail: {
        note,
        beforeIsMember: profileBefore?.is_member ?? null,
        beforeMembershipExpiresAt: profileBefore?.membership_expires_at ?? null,
        afterIsMember: updatedProfile.is_member,
        afterMembershipExpiresAt: updatedProfile.membership_expires_at,
      },
    })

    return NextResponse.json(
      { success: true, action, member: updatedProfile },
      { headers: noStoreHeaders() }
    )
  } catch (error) {
    console.error('会员管理接口异常:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500, headers: noStoreHeaders() }
    )
  }
}
