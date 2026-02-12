import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'
import { calculateMembershipExpiresAt } from '@/lib/order-state'

export interface FulfillPaidOrderInput {
  orderId: string
  transactionId: string
  paidAtIso?: string
}

export interface FulfillPaidOrderResult {
  success: boolean
  idempotent: boolean
  membershipExpiresAt?: string
  error?: string
  status?: string
  rollbackSucceeded?: boolean
}

async function fetchOrder(
  supabase: SupabaseClient<Database>,
  orderId: string
) {
  const { data, error } = await supabase
    .from('orders')
    .select('order_id, user_id, user_email, status, transaction_id, paid_at')
    .eq('order_id', orderId)
    .maybeSingle()

  if (error) {
    throw new Error(`查询订单失败: ${error.message}`)
  }

  return data
}

export async function fulfillPaidOrder(
  supabase: SupabaseClient<Database>,
  input: FulfillPaidOrderInput
): Promise<FulfillPaidOrderResult> {
  const order = await fetchOrder(supabase, input.orderId)

  if (!order) {
    return { success: false, idempotent: false, error: '订单不存在', status: 'not_found' }
  }

  if (order.status === 'paid') {
    return { success: true, idempotent: true, status: 'paid' }
  }

  if (order.status !== 'pending') {
    return {
      success: false,
      idempotent: false,
      error: `订单状态不可支付: ${order.status}`,
      status: order.status,
    }
  }

  const paidAtIso = input.paidAtIso ?? new Date().toISOString()

  const { data: updatedOrder, error: updateError } = await supabase
    .from('orders')
    .update({
      status: 'paid',
      transaction_id: input.transactionId,
      paid_at: paidAtIso,
    })
    .eq('order_id', input.orderId)
    .eq('status', 'pending')
    .select('order_id, user_id, user_email, paid_at, transaction_id')
    .maybeSingle()

  if (updateError) {
    throw new Error(`更新订单失败: ${updateError.message}`)
  }

  if (!updatedOrder) {
    const latestOrder = await fetchOrder(supabase, input.orderId)
    if (latestOrder?.status === 'paid') {
      return { success: true, idempotent: true, status: 'paid' }
    }

    return {
      success: false,
      idempotent: false,
      error: '订单状态更新冲突，请稍后重试',
      status: latestOrder?.status ?? 'unknown',
    }
  }

  const { data: profile, error: profileQueryError } = await supabase
    .from('profiles')
    .select('membership_expires_at')
    .eq('id', updatedOrder.user_id)
    .maybeSingle()

  if (profileQueryError) {
    throw new Error(`查询会员状态失败: ${profileQueryError.message}`)
  }

  const membershipExpiresAt = calculateMembershipExpiresAt(profile?.membership_expires_at, paidAtIso)

  const { error: profileUpsertError } = await supabase
    .from('profiles')
    .upsert({
      id: updatedOrder.user_id,
      email: updatedOrder.user_email,
      is_member: true,
      membership_expires_at: membershipExpiresAt,
      updated_at: paidAtIso,
    })

  if (profileUpsertError) {
    const { error: rollbackError } = await supabase
      .from('orders')
      .update({
        status: 'pending',
        transaction_id: null,
        paid_at: null,
      })
      .eq('order_id', input.orderId)
      .eq('status', 'paid')
      .eq('transaction_id', input.transactionId)
      .eq('paid_at', paidAtIso)

    return {
      success: false,
      idempotent: false,
      error: `开通会员失败: ${profileUpsertError.message}`,
      status: 'rollback',
      rollbackSucceeded: !rollbackError,
    }
  }

  return {
    success: true,
    idempotent: false,
    membershipExpiresAt,
    status: 'paid',
  }
}
