'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  LoaderCircle,
  Lock,
  QrCode,
  XCircle,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { checkPaymentStatus, type PaymentMethod } from '@/lib/payment/polling'
import { getOrderBizConfig, type OrderBizType } from '@/lib/order-biz'

const PAYMENT_METHODS = [
  { value: 'wechat' as const, label: '微信支付', icon: '💬', color: 'bg-[#ebf8f1] border-[#d8e6df]' },
  { value: 'alipay' as const, label: '支付宝', icon: '🔵', color: 'bg-[#eef6ff] border-[#d8e6df]' },
]

type PollingStatus = 'idle' | 'loading' | 'success' | 'expired' | 'error'

interface OrderResponse {
  success: boolean
  order?: {
    order_id: string
    amount: number
    payment_method: PaymentMethod
    expires_at: string
  }
  payment?: {
    method: PaymentMethod
    mode: string
    codeUrl: string | null
  }
  error?: string
}

interface PaymentFormProps {
  userEmail: string
  bizType?: OrderBizType
  amountYuan?: number
  productLabel?: string
  successRedirect?: string
}

function generateOrderId(prefix: string): string {
  const now = new Date()
  const date = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
  const random = Math.random().toString(36).substring(2, 10).toUpperCase()
  return `${prefix}_${date}_${random}`
}

export default function PaymentForm({ userEmail, bizType = 'membership', amountYuan, successRedirect }: PaymentFormProps) {
  // Determine if this is a token purchase or membership
  const isTokenFlow = bizType !== 'membership'
  const actualBizType: OrderBizType = bizType ?? 'membership'
  const initialAmount = amountYuan ?? getOrderBizConfig('membership').amountYuan

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wechat')
  const [orderId, setOrderId] = useState<string>('')
  const [amount, setAmount] = useState<number>(initialAmount)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [pollingStatus, setPollingStatus] = useState<PollingStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [showQrCode, setShowQrCode] = useState(false)

  // Update amount when bizType changes
  useEffect(() => {
    const config = getOrderBizConfig(actualBizType)
    setAmount(config.amountYuan)
  }, [actualBizType])

  // Generate order ID when component mounts or payment method changes
  useEffect(() => {
    const bizConfig = getOrderBizConfig(actualBizType)
    const newOrderId = generateOrderId(bizConfig.orderPrefix)
    setOrderId(newOrderId)
  }, [paymentMethod, actualBizType])

  // Create order and start polling
  const createOrder = useCallback(async () => {
    if (!orderId) return

    setPollingStatus('loading')
    setErrorMessage('')
    setQrCodeUrl(null)
    setShowQrCode(false)

    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          paymentMethod,
          bizType: actualBizType,
        }),
      })

      const data = (await response.json()) as OrderResponse

      if (!response.ok || !data.success) {
        throw new Error(data.error || '创建订单失败')
      }

      // Set QR code URL if available
      if (data.payment?.codeUrl) {
        setQrCodeUrl(data.payment.codeUrl)
      } else {
        // For manual payment mode, show static QR code
        setQrCodeUrl('manual')
      }

      // Start polling for payment status
      await startPolling()
    } catch (error) {
      const message = error instanceof Error ? error.message : '创建订单失败，请重试'
      setErrorMessage(message)
      setPollingStatus('error')
    }
  }, [orderId, paymentMethod, actualBizType])

  // Start polling for payment detection
  const startPolling = useCallback(async () => {
    const intervals = [5000, 10000, 15000] // 5s, 10s, 15s
    let attempt = 0

    const poll = async (): Promise<void> => {
      const interval = intervals[Math.min(attempt, intervals.length - 1)]

      const isPaid = await checkPaymentStatus(orderId, amount, paymentMethod)

      if (isPaid) {
        setPollingStatus('success')
        return
      }

      attempt++
      setTimeout(poll, interval)
    }

    await poll()
  }, [orderId, amount, paymentMethod])

  // Copy order ID to clipboard
  const copyOrderId = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(orderId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = orderId
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [orderId])

  // Retry order creation
  const handleRetry = useCallback(() => {
    const bizConfig = getOrderBizConfig(actualBizType)
    const newOrderId = generateOrderId(bizConfig.orderPrefix)
    setOrderId(newOrderId)
    setPollingStatus('idle')
    setErrorMessage('')
    setQrCodeUrl(null)
    setShowQrCode(false)
  }, [actualBizType])

  // Auto-create order when component is ready
  useEffect(() => {
    if (orderId && pollingStatus === 'idle' && !errorMessage) {
      void createOrder()
    }
  }, [orderId, pollingStatus, errorMessage, createOrder])

  // Redirect on success for token flow
  useEffect(() => {
    if (pollingStatus === 'success' && successRedirect) {
      const timer = setTimeout(() => {
        window.location.href = successRedirect
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [pollingStatus, successRedirect])

  // Success state
  if (pollingStatus === 'success') {
    return (
      <Card className="border-emerald-200 bg-emerald-50">
        <CardContent className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>
          <h3 className="text-2xl font-semibold text-emerald-900">支付成功</h3>
          <p className="mt-2 text-emerald-700">
            {isTokenFlow ? '代币已发放，正在跳转...' : '会员已开通，正在跳转...'}
          </p>
          <p className="mt-1 text-sm text-emerald-600">
            订单号：<span className="font-mono">{orderId}</span>
          </p>
          <div className="mt-6">
            <button
              onClick={() => window.location.reload()}
              className="rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              刷新页面
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Expired state
  if (pollingStatus === 'expired') {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <XCircle className="h-10 w-10 text-amber-600" />
          </div>
          <h3 className="text-2xl font-semibold text-amber-900">订单已过期</h3>
          <p className="mt-2 text-amber-700">订单超过20分钟未支付，已自动过期</p>
          <p className="mt-1 text-sm text-amber-600">
            订单号：<span className="font-mono">{orderId}</span>
          </p>
          <div className="mt-6">
            <button
              onClick={handleRetry}
              className="rounded-full bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700"
            >
              重新创建订单
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (pollingStatus === 'error') {
    return (
      <Card className="border-rose-200 bg-rose-50">
        <CardContent className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
            <AlertCircle className="h-10 w-10 text-rose-600" />
          </div>
          <h3 className="text-2xl font-semibold text-rose-900">创建订单失败</h3>
          <p className="mt-2 text-rose-700">{errorMessage}</p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={handleRetry}
              className="rounded-full bg-rose-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700"
            >
              重试
            </button>
            <button
              onClick={() => window.location.reload()}
              className="rounded-full border border-rose-600 bg-transparent px-6 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
            >
              刷新页面
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Loading state with QR code
  return (
    <div className="space-y-6">
      {/* Order ID Display - Prominently shown */}
      <Card className="border-[#b7e0d0] bg-[#eef9f4]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-[#1f7a56]">你的订单号</p>
              <p className="mt-1 font-mono text-2xl font-bold text-[#1f7a56]">{orderId || '生成中...'}</p>
              <p className="mt-2 text-sm text-[#1f7a56]/80">
                此订单号已自动填入支付备注，无需手动输入
              </p>
            </div>
            <button
              onClick={copyOrderId}
              disabled={!orderId || copied}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1f7a56]/10 text-[#1f7a56] transition hover:bg-[#1f7a56]/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {copied ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method Selection */}
      <div>
        <p className="mb-3 text-sm font-medium text-slate-700">选择支付方式</p>
        <div className="grid grid-cols-2 gap-3">
          {PAYMENT_METHODS.map((method) => (
            <button
              key={method.value}
              type="button"
              onClick={() => setPaymentMethod(method.value as 'wechat' | 'alipay')}
              disabled={pollingStatus === 'loading'}
              className={`rounded-xl border-2 p-4 text-left transition ${
                paymentMethod === method.value
                  ? method.color
                  : 'border-[#d8e6df] bg-white hover:bg-[#f8fbf9]'
              }`}
            >
              <span className="text-2xl">{method.icon}</span>
              <span className="mt-2 block font-semibold">{method.label}</span>
              <span className="mt-1 text-sm text-slate-600">¥{amount}</span>
            </button>
          ))}
        </div>
      </div>

      {/* QR Code Display with blur protection */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#e3f0eb] text-[var(--brand-fresh)]">
              {pollingStatus === 'loading' ? (
                <LoaderCircle className="h-6 w-6 animate-spin" />
              ) : (
                <QrCode className="h-6 w-6" />
              )}
            </div>

            <h3 className="text-xl font-semibold text-slate-900">
              {pollingStatus === 'loading' ? '扫码支付' : '支付二维码'}
            </h3>

            <p className="mt-2 text-sm text-slate-600">
              使用{paymentMethod === 'wechat' ? '微信' : '支付宝'}扫描二维码完成支付
            </p>

            <div className="mt-6 rounded-xl border-2 border-dashed border-[#d8e6df] bg-[#f8fbf9] p-6 relative">
              {!showQrCode ? (
                <div
                  className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/60 backdrop-blur-sm"
                  style={{ backdropFilter: 'blur(8px)' }}
                  onClick={() => setShowQrCode(true)}
                >
                    <Lock className="h-12 w-12 text-emerald-400 mx-auto mb-2" />
                    <p className="text-lg font-semibold">点击查看收款码</p>
                    <p className="text-sm text-slate-300">保护你的隐私安全</p>
                  </div>
                ) : (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/payment/wechat.jpg"
                    alt="微信支付"
                    className="h-48 w-48"
                  />
                  {/* eslint-enable-next-line @next/next/no-img-element */}
                </>
              )}
            </div>

            <div className="mt-6 space-y-2 text-sm text-slate-600">
              <p className="font-semibold">支付说明</p>
              <p>1. 点击按钮查看收款码</p>
              <p>2. 扫描上方二维码</p>
              <p>3. 确认支付金额：¥{amount}</p>
              <p>4. 订单号已自动填入备注</p>
              <p className="font-semibold text-[var(--brand-fresh)]">5. 支付完成后会员将自动开通</p>
            </div>

            <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              <span>正在检测支付状态...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
