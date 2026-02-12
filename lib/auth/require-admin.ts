import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/auth/admin'

interface RequireAdminSuccess {
  ok: true
  email: string
}

interface RequireAdminFailed {
  ok: false
  status: 401 | 403
  error: string
}

export type RequireAdminResult = RequireAdminSuccess | RequireAdminFailed

export async function requireAdmin(): Promise<RequireAdminResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) {
    return { ok: false, status: 401, error: '未登录' }
  }

  if (!isAdminEmail(user.email)) {
    return { ok: false, status: 403, error: '无管理员权限' }
  }

  return { ok: true, email: user.email }
}
