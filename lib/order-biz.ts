export type OrderBizType = 'membership' | 'token_basic' | 'token_pro'

export interface OrderBizConfig {
  type: OrderBizType
  label: string
  orderPrefix: string
  amountYuan: number
  tokenGrant: number
}

function safePositiveNumber(raw: string | undefined, fallback: number): number {
  const value = Number(raw)
  return Number.isFinite(value) && value > 0 ? value : fallback
}

export function getOrderBizConfig(type: OrderBizType): OrderBizConfig {
  const membershipPrice = safePositiveNumber(process.env.NEXT_PUBLIC_MEMBERSHIP_PRICE, 499)
  const tokenBasicPrice = safePositiveNumber(process.env.TOKEN_PACK_BASIC_PRICE, 39)
  const tokenProPrice = safePositiveNumber(process.env.TOKEN_PACK_PRO_PRICE, 99)

  const configs: Record<OrderBizType, OrderBizConfig> = {
    membership: {
      type: 'membership',
      label: '年度会员',
      orderPrefix: 'ORDER',
      amountYuan: membershipPrice,
      tokenGrant: 0,
    },
    token_basic: {
      type: 'token_basic',
      label: '代币包（100）',
      orderPrefix: 'TOK100',
      amountYuan: tokenBasicPrice,
      tokenGrant: 100,
    },
    token_pro: {
      type: 'token_pro',
      label: '代币包（300）',
      orderPrefix: 'TOK300',
      amountYuan: tokenProPrice,
      tokenGrant: 300,
    },
  }

  return configs[type]
}

export function parseOrderBizType(raw: unknown): OrderBizType {
  if (raw === 'token_basic' || raw === 'token_pro' || raw === 'membership') {
    return raw
  }
  return 'membership'
}

export function detectOrderBizTypeFromOrderId(orderId: string): OrderBizType {
  if (orderId.startsWith('TOK100_')) return 'token_basic'
  if (orderId.startsWith('TOK300_')) return 'token_pro'
  return 'membership'
}
