import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Service Role 客户端。
 *
 * 仅用于服务端受控接口（如支付回调、定时对账），
 * 绝不能在客户端组件中调用。
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error('Supabase admin client 缺少必要环境变量')
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
