import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth/require-admin'

const USER_FETCH_LIMIT = 300

interface ProfileSummary {
  id: string
  is_member: boolean
  membership_expires_at: string | null
}

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
    const { data, error } = await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: USER_FETCH_LIMIT,
    })

    if (error) {
      console.error('查询后台用户失败:', error)
      return NextResponse.json({ error: '查询用户失败' }, { status: 500, headers: noStoreHeaders() })
    }

    const users = data?.users ?? []
    const userIds = users.map((user) => user.id)
    const profileById = new Map<string, ProfileSummary>()

    if (userIds.length > 0) {
      const { data: profiles, error: profileError } = await adminClient
        .from('profiles')
        .select('id, is_member, membership_expires_at')
        .in('id', userIds)

      if (profileError) {
        console.error('查询用户会员信息失败:', profileError)
      } else {
        for (const profile of (profiles ?? []) as ProfileSummary[]) {
          profileById.set(profile.id, profile)
        }
      }
    }

    const normalizedUsers = users.map((user) => {
      const profile = profileById.get(user.id)
      return {
        id: user.id,
        email: user.email ?? '',
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        email_confirmed_at: user.email_confirmed_at,
        is_member: profile?.is_member ?? false,
        membership_expires_at: profile?.membership_expires_at ?? null,
      }
    })

    return NextResponse.json(
      {
        users: normalizedUsers,
        fetchedAt: new Date().toISOString(),
      },
      { headers: noStoreHeaders() }
    )
  } catch (error) {
    console.error('后台用户接口异常:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500, headers: noStoreHeaders() })
  }
}
