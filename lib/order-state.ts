export type OrderStatus = 'pending' | 'paid' | 'expired' | 'cancelled'

export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  pending: ['paid', 'expired', 'cancelled'],
  paid: [],
  expired: [],
  cancelled: [],
}

export function canTransitOrderStatus(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_STATUS_TRANSITIONS[from].includes(to)
}

function parseIsoTime(value: string | null | undefined): Date | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function addOneYear(base: Date): Date {
  const next = new Date(base)
  next.setUTCFullYear(next.getUTCFullYear() + 1)
  return next
}

/**
 * 会员规则：
 * - 新开通：从支付时间起 +1 年
 * - 续期：若当前仍有效，从当前到期时间继续 +1 年；若已过期，则从支付时间 +1 年
 */
export function calculateMembershipExpiresAt(
  currentMembershipExpiresAt: string | null | undefined,
  paidAtIso: string
): string {
  const paidAt = parseIsoTime(paidAtIso)
  if (!paidAt) {
    throw new Error('paidAtIso 无效')
  }

  const currentExpiresAt = parseIsoTime(currentMembershipExpiresAt)
  const activeBase =
    currentExpiresAt && currentExpiresAt.getTime() > paidAt.getTime()
      ? currentExpiresAt
      : paidAt

  return addOneYear(activeBase).toISOString()
}

export function hasOrderExpired(expiresAtIso: string, now = new Date()): boolean {
  const expiresAt = parseIsoTime(expiresAtIso)
  if (!expiresAt) return true
  return expiresAt.getTime() <= now.getTime()
}
