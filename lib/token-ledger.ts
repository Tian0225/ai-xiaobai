import type { SupabaseClient } from '@supabase/supabase-js'

interface WriteTokenLedgerInput {
  userId: string
  userEmail: string
  orderId?: string | null
  bizType: 'token_basic' | 'token_pro' | 'token_consume'
  changeAmount: number
  balanceAfter: number
  note?: string
}

export async function writeTokenLedger(
  supabase: SupabaseClient,
  input: WriteTokenLedgerInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await supabase.from('token_ledger').insert({
    user_id: input.userId,
    user_email: input.userEmail,
    order_id: input.orderId ?? null,
    biz_type: input.bizType,
    change_amount: input.changeAmount,
    balance_after: input.balanceAfter,
    note: input.note ?? '订单支付发放代币',
  })

  if (error) {
    return { ok: false, error: error.message }
  }

  return { ok: true }
}
