import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { calculateMembershipExpiresAt } from '@/lib/order-state'

type RedeemCodeStatus = 'unused' | 'used' | 'disabled'

interface RedeemCodeRow {
  code: string
  status: RedeemCodeStatus
  used_by: string | null
  used_by_email: string | null
  used_at: string | null
  expires_at: string | null
}

interface ProfileRow {
  membership_expires_at: string | null
}

function normalizeCode(raw: unknown): string {
  return String(raw ?? '')
    .trim()
    .toUpperCase()
}

function isValidCodeFormat(code: string): boolean {
  return /^[A-Z0-9]{16,64}$/.test(code)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const code = normalizeCode(body?.code)

    if (!isValidCodeFormat(code)) {
      return NextResponse.json({ error: '卡密格式不正确' }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '请先登录后再兑换' }, { status: 401 })
    }
    if (!user.email) {
      return NextResponse.json({ error: '账号邮箱缺失，无法兑换' }, { status: 400 })
    }

    const admin = createAdminClient()
    const nowIso = new Date().toISOString()

    const { data: codeRecord, error: codeQueryError } = await admin
      .from('redeem_codes')
      .select('code, status, used_by, used_by_email, used_at, expires_at')
      .eq('code', code)
      .maybeSingle()

    if (codeQueryError) {
      console.error('查询卡密失败:', codeQueryError)
      return NextResponse.json({ error: '兑换失败，请稍后重试' }, { status: 500 })
    }

    const redeemCode = (codeRecord as RedeemCodeRow | null) ?? null
    if (!redeemCode) {
      return NextResponse.json({ error: '卡密不存在' }, { status: 404 })
    }

    if (redeemCode.expires_at && new Date(redeemCode.expires_at).getTime() <= Date.now()) {
      return NextResponse.json({ error: '卡密已过期' }, { status: 409 })
    }

    if (redeemCode.status === 'disabled') {
      return NextResponse.json({ error: '卡密不可用，请联系客服' }, { status: 409 })
    }

    if (redeemCode.status === 'used') {
      if (redeemCode.used_by === user.id) {
        return NextResponse.json({
          success: true,
          idempotent: true,
          message: '该卡密已兑换，无需重复提交',
          code,
        })
      }
      return NextResponse.json({ error: '卡密已被使用' }, { status: 409 })
    }

    const { data: lockResult, error: lockError } = await admin
      .from('redeem_codes')
      .update({
        status: 'used',
        used_by: user.id,
        used_by_email: user.email,
        used_at: nowIso,
      })
      .eq('code', code)
      .eq('status', 'unused')
      .select('code, status, used_by, used_by_email, used_at, expires_at')
      .maybeSingle()

    if (lockError) {
      console.error('卡密锁定失败:', lockError)
      return NextResponse.json({ error: '兑换失败，请稍后重试' }, { status: 500 })
    }

    const lockedCode = (lockResult as RedeemCodeRow | null) ?? null
    if (!lockedCode) {
      const { data: latestCode } = await admin
        .from('redeem_codes')
        .select('code, status, used_by, used_by_email, used_at, expires_at')
        .eq('code', code)
        .maybeSingle()

      const safeLatestCode = (latestCode as RedeemCodeRow | null) ?? null
      if (safeLatestCode?.status === 'used' && safeLatestCode.used_by === user.id) {
        return NextResponse.json({
          success: true,
          idempotent: true,
          message: '该卡密已兑换，无需重复提交',
          code,
        })
      }

      return NextResponse.json({ error: '卡密已被其他用户使用' }, { status: 409 })
    }

    const { data: profile, error: profileQueryError } = await admin
      .from('profiles')
      .select('membership_expires_at')
      .eq('id', user.id)
      .maybeSingle()

    if (profileQueryError) {
      console.error('查询会员信息失败:', profileQueryError)
      return NextResponse.json({ error: '兑换失败，请稍后重试' }, { status: 500 })
    }

    const membershipExpiresAt = calculateMembershipExpiresAt(
      (profile as ProfileRow | null)?.membership_expires_at ?? null,
      nowIso
    )

    const { error: profileUpdateError } = await admin.from('profiles').upsert({
      id: user.id,
      email: user.email,
      is_member: true,
      membership_expires_at: membershipExpiresAt,
      updated_at: nowIso,
    })

    if (profileUpdateError) {
      console.error('更新会员信息失败:', profileUpdateError)
      const { error: rollbackError } = await admin
        .from('redeem_codes')
        .update({
          status: 'unused',
          used_by: null,
          used_by_email: null,
          used_at: null,
        })
        .eq('code', code)
        .eq('used_by', user.id)
        .eq('used_at', nowIso)

      return NextResponse.json(
        {
          error: '开通会员失败，请联系客服处理',
          rollbackSucceeded: !rollbackError,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      idempotent: false,
      code,
      membershipExpiresAt,
      message: '兑换成功，会员已开通',
    })
  } catch (error) {
    console.error('卡密兑换异常:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
