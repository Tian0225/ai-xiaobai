/**
 * 支付对账适配层
 *
 * 使用环境变量配置微信/支付宝账单查询 API（或你自己的支付网关），
 * 并统一标准化交易记录结构供订单对账使用。
 */

export type PaymentMethod = 'wechat' | 'alipay'

export interface Transaction {
  id: string
  amount: number
  remark: string
  createdAt: string
  type: PaymentMethod
  status: string
}

interface ProviderConfig {
  method: PaymentMethod
  url?: string
  token?: string
}

const REQUEST_TIMEOUT_MS = Number(process.env.PAYMENT_ADAPTER_TIMEOUT_MS ?? 10_000)
const POLL_WINDOW_MINUTES = Number(process.env.PAYMENT_POLL_WINDOW_MINUTES ?? 20)
const SUCCESS_STATUSES = new Set(['SUCCESS', 'PAY_SUCCESS', 'TRADE_SUCCESS', 'TRADE_FINISHED'])

function toSafeString(value: unknown) {
  if (value == null) return ''
  return String(value).trim()
}

function toISODate(value: unknown) {
  const raw = toSafeString(value)
  if (!raw) return new Date().toISOString()
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return new Date().toISOString()
  return date.toISOString()
}

function toAmountYuan(value: unknown, fenValue: unknown) {
  const fenRaw = toSafeString(fenValue)
  if (fenRaw) {
    const fen = Number(fenRaw)
    if (Number.isFinite(fen)) {
      return fen / 100
    }
  }

  const raw = toSafeString(value)
  if (!raw) return 0
  const amount = Number(raw)
  if (!Number.isFinite(amount)) return 0
  return amount
}

function normalizeStatus(raw: unknown) {
  const status = toSafeString(raw).toUpperCase()
  return status || 'UNKNOWN'
}

function normalizeTransaction(raw: Record<string, unknown>, method: PaymentMethod): Transaction | null {
  const id = toSafeString(
    raw.id ?? raw.transactionId ?? raw.transaction_id ?? raw.trade_no ?? raw.out_trade_no
  )

  if (!id) return null

  const remark = toSafeString(raw.remark ?? raw.attach ?? raw.memo ?? raw.body ?? raw.note)
  const createdAt = toISODate(
    raw.createdAt ??
      raw.created_at ??
      raw.payTime ??
      raw.pay_time ??
      raw.success_time ??
      raw.gmt_payment
  )
  const amount = toAmountYuan(
    raw.amount ?? raw.total_amount ?? raw.pay_amount ?? raw.totalFee,
    raw.amount_fen ?? raw.amountFen ?? raw.total_fee ?? raw.cash_fee
  )
  const status = normalizeStatus(raw.status ?? raw.trade_status ?? raw.state ?? raw.tradeState)

  return {
    id,
    amount,
    remark,
    createdAt,
    type: method,
    status,
  }
}

function getProviderConfig(method: PaymentMethod): ProviderConfig {
  if (method === 'wechat') {
    return {
      method,
      url: process.env.WECHAT_BILL_API_URL,
      token: process.env.WECHAT_BILL_API_TOKEN,
    }
  }

  return {
    method,
    url: process.env.ALIPAY_BILL_API_URL,
    token: process.env.ALIPAY_BILL_API_TOKEN,
  }
}

async function fetchTransactionsFromProvider(
  config: ProviderConfig,
  startTime: Date,
  endTime: Date
): Promise<Transaction[]> {
  if (!config.url || !config.token) {
    throw new Error(`${config.method} 账单 API 未配置`)
  }

  const endpoint = new URL(config.url)
  endpoint.searchParams.set('startTime', startTime.toISOString())
  endpoint.searchParams.set('endTime', endTime.toISOString())
  endpoint.searchParams.set('paymentMethod', config.method)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(endpoint.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      cache: 'no-store',
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`${config.method} 账单 API 调用失败: ${response.status} ${text.slice(0, 160)}`)
    }

    const payload = await response.json()
    const rows: unknown[] = Array.isArray(payload)
      ? payload
      : Array.isArray(payload.transactions)
        ? payload.transactions
        : Array.isArray(payload.data)
          ? payload.data
          : []

    return rows
      .filter((row): row is Record<string, unknown> => row != null && typeof row === 'object')
      .map((row) => normalizeTransaction(row, config.method))
      .filter((row): row is Transaction => row !== null)
  } finally {
    clearTimeout(timeout)
  }
}

function isMatchedOrder(transaction: Transaction, orderId: string, amount: number) {
  return (
    transaction.remark.includes(orderId) &&
    transaction.amount >= amount &&
    SUCCESS_STATUSES.has(transaction.status)
  )
}

export async function getWechatTransactions(startTime: Date, endTime: Date): Promise<Transaction[]> {
  return fetchTransactionsFromProvider(getProviderConfig('wechat'), startTime, endTime)
}

export async function getAlipayTransactions(startTime: Date, endTime: Date): Promise<Transaction[]> {
  return fetchTransactionsFromProvider(getProviderConfig('alipay'), startTime, endTime)
}

export async function checkPaymentStatus(
  orderId: string,
  amount: number,
  paymentMethod: PaymentMethod
): Promise<boolean> {
  const now = new Date()
  const startTime = new Date(now.getTime() - POLL_WINDOW_MINUTES * 60 * 1000)
  const transactions =
    paymentMethod === 'wechat'
      ? await getWechatTransactions(startTime, now)
      : await getAlipayTransactions(startTime, now)

  return transactions.some((transaction) => isMatchedOrder(transaction, orderId, amount))
}
