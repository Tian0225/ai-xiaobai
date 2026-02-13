import type { SupabaseClient } from '@supabase/supabase-js'
import { calculateMembershipExpiresAt } from '@/lib/order-state'
import { detectOrderBizTypeFromOrderId, getOrderBizConfig } from '@/lib/order-biz'
import { writeTokenLedger } from '@/lib/token-ledger'

type OrderStatus = 'pending' | 'paid' | 'expired' | 'cancelled'

interface OrderForFulfillment {
  order_id: string
  user_id: string
  user_email: string
  status: OrderStatus
  transaction_id: string | null
  paid_at: string | null
}

interface UpdatedOrder {
  order_id: string
  user_id: string
  user_email: string
  transaction_id: string | null
  paid_at: string | null
}

interface ProfileMembership {
  membership_expires_at: string | null
  token_balance?: number | null
}

export interface FulfillPaidOrderInput {
  orderId: string
  transactionId: string
  paidAtIso?: string
}

export interface FulfillPaidOrderResult {
  success: boolean
  idempotent: boolean
  membershipExpiresAt?: string
  grantType?: 'membership' | 'token'
  tokenGranted?: number
  tokenBalance?: number
  error?: string
  status?: string
  rollbackSucceeded?: boolean
}

async function fetchOrder(
  supabase: SupabaseClient,
  orderId: string
): Promise<OrderForFulfillment | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('order_id, user_id, user_email, status, transaction_id, paid_at')
    .eq('order_id', orderId)
    .maybeSingle()

  if (error) {
    throw new Error(`查询订单失败: ${error.message}`)
  }

  return data as OrderForFulfillment | null
}

export async function fulfillPaidOrder(
  supabase: SupabaseClient,
  input: FulfillPaidOrderInput
): Promise<FulfillPaidOrderResult> {
  const order = await fetchOrder(supabase, input.orderId)

  if (!order) {
    return { success: false, idempotent: false, error: '订单不存在', status: 'not_found' }
  }

  if (order.status === 'paid') {
    const bizType = detectOrderBizTypeFromOrderId(order.order_id)
    return {
      success: true,
      idempotent: true,
      status: 'paid',
      grantType: bizType === 'membership' ? 'membership' : 'token',
    }
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

  const safeUpdatedOrder = updatedOrder as UpdatedOrder | null

  if (!safeUpdatedOrder) {
    const latestOrder = await fetchOrder(supabase, input.orderId)
    if (latestOrder?.status === 'paid') {
      return { success: true, idempotent: true, status: 'paid' }
    }

    return {
      success: false,
      idempotent: false,
      error: '订单状态更新冲突，请稍后重试',
      status: (latestOrder?.status ?? 'unknown') as OrderStatus | 'unknown',
    }
  }

  const bizType = detectOrderBizTypeFromOrderId(safeUpdatedOrder.order_id)
  const bizConfig = getOrderBizConfig(bizType)

  if (bizType !== 'membership') {
    const { data: profile, error: profileQueryError } = await supabase
      .from('profiles')
      .select('token_balance')
      .eq('id', safeUpdatedOrder.user_id)
      .maybeSingle()

    if (profileQueryError) {
      throw new Error(`查询代币余额失败: ${profileQueryError.message}`)
    }

    const safeProfile = profile as ProfileMembership | null
    const currentBalance = Number(safeProfile?.token_balance ?? 0)
    const tokenBalance = (Number.isFinite(currentBalance) ? currentBalance : 0) + bizConfig.tokenGrant

    const { error: profileUpsertError } = await supabase.from('profiles').upsert({
      id: safeUpdatedOrder.user_id,
      email: safeUpdatedOrder.user_email,
      token_balance: tokenBalance,
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
        error: `发放代币失败: ${profileUpsertError.message}`,
        status: 'rollback',
        rollbackSucceeded: !rollbackError,
      }
    }

    const ledgerWrite = await writeTokenLedger(supabase, {
      userId: safeUpdatedOrder.user_id,
      userEmail: safeUpdatedOrder.user_email,
      orderId: safeUpdatedOrder.order_id,
      bizType,
      changeAmount: bizConfig.tokenGrant,
      balanceAfter: tokenBalance,
      note: `支付发放 ${bizConfig.label}`,
    })

    if (!ledgerWrite.ok) {
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
        error: `写入代币流水失败: ${ledgerWrite.error}`,
        status: 'rollback',
        rollbackSucceeded: !rollbackError,
      }
    }

    return {
      success: true,
      idempotent: false,
      grantType: 'token',
      tokenGranted: bizConfig.tokenGrant,
      tokenBalance,
      status: 'paid',
    }
  }

  const { data: profile, error: profileQueryError } = await supabase
    .from('profiles')
    .select('membership_expires_at')
    .eq('id', safeUpdatedOrder.user_id)
    .maybeSingle()

  if (profileQueryError) {
    throw new Error(`查询会员状态失败: ${profileQueryError.message}`)
  }

  const safeProfile = profile as ProfileMembership | null
  const membershipExpiresAt = calculateMembershipExpiresAt(safeProfile?.membership_expires_at, paidAtIso)

  const { error: profileUpsertError } = await supabase.from('profiles').upsert({
    id: safeUpdatedOrder.user_id,
    email: safeUpdatedOrder.user_email,
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
    grantType: 'membership',
    membershipExpiresAt,
    status: 'paid',
  }
}
