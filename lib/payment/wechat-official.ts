import { createDecipheriv, createSign, createVerify, randomBytes } from 'node:crypto'

interface WechatOfficialConfig {
  mchId: string
  appId: string
  serialNo: string
  privateKeyPem: string
  apiV3Key: string
  notifyUrl: string
  apiBase: string
}

export interface WechatNativeOrderRequest {
  outTradeNo: string
  amountFen: number
  description: string
  attach?: string
}

export interface WechatNativeOrderResult {
  codeUrl: string
  prepayId?: string
}

interface WechatCertificateItem {
  serial_no: string
  effective_time: string
  expire_time: string
  encrypt_certificate: {
    algorithm: string
    nonce: string
    associated_data: string
    ciphertext: string
  }
}

interface WechatCertificatesResponse {
  data: WechatCertificateItem[]
}

interface WechatPayNotificationResource {
  algorithm: string
  ciphertext: string
  nonce: string
  associated_data: string
  original_type: string
}

interface WechatPayNotificationBody {
  id: string
  create_time: string
  event_type: string
  summary: string
  resource_type: string
  resource: WechatPayNotificationResource
}

export interface WechatPayTransaction {
  transaction_id: string
  out_trade_no: string
  trade_state: string
  success_time?: string
  amount?: {
    payer_total?: number
    total?: number
    currency?: string
    payer_currency?: string
  }
  [key: string]: unknown
}

const FIVE_MINUTES_MS = 5 * 60 * 1000

let certCache: {
  fetchedAt: number
  serialToPem: Map<string, string>
} | null = null

function mustGetEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`缺少环境变量: ${name}`)
  }
  return value
}

function getConfig(): WechatOfficialConfig {
  const apiBase = (process.env.WECHAT_PAY_API_BASE ?? 'https://api.mch.weixin.qq.com').trim()
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '')
  const notifyUrl =
    process.env.WECHAT_PAY_NOTIFY_URL?.trim() ||
    (siteUrl ? `${siteUrl}/api/payments/wechat/notify` : '')

  return {
    mchId: mustGetEnv('WECHAT_PAY_MCH_ID'),
    appId: mustGetEnv('WECHAT_PAY_APP_ID'),
    serialNo: mustGetEnv('WECHAT_PAY_MCH_SERIAL_NO'),
    privateKeyPem: mustGetEnv('WECHAT_PAY_MCH_PRIVATE_KEY').replace(/\\n/g, '\n'),
    apiV3Key: mustGetEnv('WECHAT_PAY_API_V3_KEY'),
    notifyUrl: notifyUrl || mustGetEnv('WECHAT_PAY_NOTIFY_URL'),
    apiBase,
  }
}

function buildSignatureMessage(
  method: string,
  urlPathWithQuery: string,
  timestamp: string,
  nonceStr: string,
  body: string
) {
  return `${method}\n${urlPathWithQuery}\n${timestamp}\n${nonceStr}\n${body}\n`
}

function signWithMerchantPrivateKey(message: string, privateKeyPem: string) {
  const signer = createSign('RSA-SHA256')
  signer.update(message)
  signer.end()
  return signer.sign(privateKeyPem, 'base64')
}

function buildWechatAuthorization(
  method: string,
  urlPathWithQuery: string,
  body: string,
  config: WechatOfficialConfig
) {
  const timestamp = String(Math.floor(Date.now() / 1000))
  const nonceStr = randomBytes(16).toString('hex')
  const message = buildSignatureMessage(method, urlPathWithQuery, timestamp, nonceStr, body)
  const signature = signWithMerchantPrivateKey(message, config.privateKeyPem)

  return `WECHATPAY2-SHA256-RSA2048 mchid=\"${config.mchId}\",nonce_str=\"${nonceStr}\",timestamp=\"${timestamp}\",serial_no=\"${config.serialNo}\",signature=\"${signature}\"`
}

function decryptWechatResource(resource: WechatPayNotificationResource, apiV3Key: string) {
  if (resource.algorithm !== 'AEAD_AES_256_GCM') {
    throw new Error(`不支持的微信通知加密算法: ${resource.algorithm}`)
  }

  const key = Buffer.from(apiV3Key, 'utf8')
  if (key.length !== 32) {
    throw new Error('WECHAT_PAY_API_V3_KEY 长度必须是 32 字节')
  }

  const nonce = Buffer.from(resource.nonce, 'utf8')
  const ciphertextWithTag = Buffer.from(resource.ciphertext, 'base64')
  const aad = Buffer.from(resource.associated_data || '', 'utf8')

  if (ciphertextWithTag.length < 16) {
    throw new Error('微信回调密文长度非法')
  }

  const ciphertext = ciphertextWithTag.subarray(0, ciphertextWithTag.length - 16)
  const authTag = ciphertextWithTag.subarray(ciphertextWithTag.length - 16)

  const decipher = createDecipheriv('aes-256-gcm', key, nonce)
  decipher.setAuthTag(authTag)
  if (aad.length > 0) {
    decipher.setAAD(aad)
  }

  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()])
  return JSON.parse(decrypted.toString('utf8')) as WechatPayTransaction
}

async function fetchPlatformCertificates(config: WechatOfficialConfig): Promise<Map<string, string>> {
  if (certCache && Date.now() - certCache.fetchedAt < FIVE_MINUTES_MS) {
    return certCache.serialToPem
  }

  const path = '/v3/certificates'
  const authorization = buildWechatAuthorization('GET', path, '', config)

  const response = await fetch(`${config.apiBase}${path}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: authorization,
      'User-Agent': 'ai-xiaobai/1.0',
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`微信平台证书拉取失败: ${response.status} ${text.slice(0, 180)}`)
  }

  const payload = (await response.json()) as WechatCertificatesResponse
  const serialToPem = new Map<string, string>()

  for (const cert of payload.data ?? []) {
    const pem = decryptCertificatePem(cert, config.apiV3Key)
    serialToPem.set(cert.serial_no, pem)
  }

  if (serialToPem.size === 0) {
    throw new Error('微信平台证书为空，无法验签回调')
  }

  certCache = {
    fetchedAt: Date.now(),
    serialToPem,
  }

  return serialToPem
}

function decryptCertificatePem(certificate: WechatCertificateItem, apiV3Key: string) {
  const resource: WechatPayNotificationResource = {
    algorithm: certificate.encrypt_certificate.algorithm,
    nonce: certificate.encrypt_certificate.nonce,
    associated_data: certificate.encrypt_certificate.associated_data,
    ciphertext: certificate.encrypt_certificate.ciphertext,
    original_type: 'CERTIFICATE',
  }

  const key = Buffer.from(apiV3Key, 'utf8')
  if (key.length !== 32) {
    throw new Error('WECHAT_PAY_API_V3_KEY 长度必须是 32 字节')
  }

  const nonce = Buffer.from(resource.nonce, 'utf8')
  const ciphertextWithTag = Buffer.from(resource.ciphertext, 'base64')
  const aad = Buffer.from(resource.associated_data || '', 'utf8')

  const ciphertext = ciphertextWithTag.subarray(0, ciphertextWithTag.length - 16)
  const authTag = ciphertextWithTag.subarray(ciphertextWithTag.length - 16)

  const decipher = createDecipheriv('aes-256-gcm', key, nonce)
  decipher.setAuthTag(authTag)
  if (aad.length > 0) {
    decipher.setAAD(aad)
  }

  const decoded = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8')

  if (!decoded.includes('BEGIN CERTIFICATE')) {
    throw new Error('微信平台证书解密结果非法')
  }

  return decoded
}

async function verifyWechatCallbackSignature(body: string, headers: Headers, config: WechatOfficialConfig) {
  const timestamp = headers.get('wechatpay-timestamp')
  const nonce = headers.get('wechatpay-nonce')
  const serial = headers.get('wechatpay-serial')
  const signature = headers.get('wechatpay-signature')

  if (!timestamp || !nonce || !serial || !signature) {
    throw new Error('微信回调头缺失签名字段')
  }

  const timestampInt = Number(timestamp)
  if (!Number.isFinite(timestampInt)) {
    throw new Error('微信回调时间戳非法')
  }

  const nowSec = Math.floor(Date.now() / 1000)
  if (Math.abs(nowSec - timestampInt) > 5 * 60) {
    throw new Error('微信回调时间戳超出允许范围')
  }

  const certs = await fetchPlatformCertificates(config)
  const certPem = certs.get(serial)
  if (!certPem) {
    throw new Error('未找到匹配的微信平台证书序列号')
  }

  const message = `${timestamp}\n${nonce}\n${body}\n`
  const verifier = createVerify('RSA-SHA256')
  verifier.update(message)
  verifier.end()

  const ok = verifier.verify(certPem, signature, 'base64')
  if (!ok) {
    throw new Error('微信回调签名校验失败')
  }
}

function toFen(amountYuan: number) {
  return Math.round(amountYuan * 100)
}

export async function createWechatNativeOrder(input: WechatNativeOrderRequest): Promise<WechatNativeOrderResult> {
  const config = getConfig()

  if (!Number.isFinite(input.amountFen) || input.amountFen <= 0) {
    throw new Error('微信下单金额非法')
  }

  const body = JSON.stringify({
    mchid: config.mchId,
    appid: config.appId,
    description: input.description,
    out_trade_no: input.outTradeNo,
    notify_url: config.notifyUrl,
    attach: input.attach,
    amount: {
      total: input.amountFen,
      currency: 'CNY',
    },
  })

  const path = '/v3/pay/transactions/native'
  const authorization = buildWechatAuthorization('POST', path, body, config)

  const response = await fetch(`${config.apiBase}${path}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: authorization,
      'User-Agent': 'ai-xiaobai/1.0',
    },
    body,
    cache: 'no-store',
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`微信下单失败: ${response.status} ${text.slice(0, 180)}`)
  }

  const payload = (await response.json()) as { code_url?: string; prepay_id?: string }
  if (!payload.code_url) {
    throw new Error('微信下单返回缺少 code_url')
  }

  return {
    codeUrl: payload.code_url,
    prepayId: payload.prepay_id,
  }
}

export async function parseVerifiedWechatPayNotify(
  rawBody: string,
  headers: Headers
): Promise<WechatPayTransaction> {
  const config = getConfig()
  await verifyWechatCallbackSignature(rawBody, headers, config)

  const body = JSON.parse(rawBody) as WechatPayNotificationBody
  if (!body.resource) {
    throw new Error('微信回调缺少 resource 字段')
  }

  return decryptWechatResource(body.resource, config.apiV3Key)
}

export function yuanToFen(amountYuan: number) {
  return toFen(amountYuan)
}
