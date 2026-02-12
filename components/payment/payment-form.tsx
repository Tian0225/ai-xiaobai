'use client'

import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, CheckCircle2, LoaderCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface PaymentFormProps {
  userEmail: string
}

interface CheckOrderResponse {
  paid?: boolean
  expired?: boolean
  status?: string
  isMember?: boolean
}

const MEMBERSHIP_PRICE = Number(process.env.NEXT_PUBLIC_MEMBERSHIP_PRICE ?? 499)
const PAYMENT_METHOD_TEXT = {
  wechat: '微信支付',
  alipay: '支付宝支付',
} as const

function secondsUntil(expiresAt: string | undefined): number {
  if (!expiresAt) return 600
  const end = new Date(expiresAt)
  if (Number.isNaN(end.getTime())) return 600
  return Math.max(0, Math.floor((end.getTime() - Date.now()) / 1000))
}

function StatusBanner({
  state,
  redirectCountdown,
}: {
  state: 'loading' | 'success' | 'warning' | 'error' | 'idle'
  redirectCountdown: number
}) {
  if (state === 'success') {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
        <p className="inline-flex items-center gap-2 font-semibold text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          支付成功，会员权限已开通
        </p>
        <p className="mt-2 text-emerald-700">{redirectCountdown} 秒后自动跳转到会员状态页。</p>
      </div>
    )
  }

  if (state === 'warning') {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
        <p className="inline-flex items-center gap-2 font-semibold">
          <AlertTriangle className="h-4 w-4" />
          订单已过期
        </p>
        <p className="mt-2">请重新生成新订单并在 10 分钟内完成支付。</p>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        <p className="inline-flex items-center gap-2 font-semibold">
          <AlertTriangle className="h-4 w-4" />
          支付状态获取失败
        </p>
        <p className="mt-2">网络波动或接口异常，请稍后重试。</p>
      </div>
    )
  }

  if (state === 'loading') {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-[#bfe2d2] bg-[#eef8f3] p-4 text-sm text-[var(--brand-fresh)]">
        <LoaderCircle className="h-4 w-4 animate-spin" />
        正在检测支付状态，每 5 秒自动刷新一次
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-[#d8e6df] bg-white px-4 py-3 text-sm text-slate-600">
      扫码后请勿关闭页面，系统会自动完成到账检测。
    </div>
  )
}

export default function PaymentForm({ userEmail }: PaymentFormProps) {
  const [orderId, setOrderId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'wechat' | 'alipay'>('wechat')
  const [showQR, setShowQR] = useState(false)
  const [polling, setPolling] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [paymentExpired, setPaymentExpired] = useState(false)
  const [redirectCountdown, setRedirectCountdown] = useState(3)
  const [loadingDots, setLoadingDots] = useState(1)
  const [creatingOrder, setCreatingOrder] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [wechatCodeUrl, setWechatCodeUrl] = useState('')
  const pollingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pollingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const stopPolling = () => {
    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current)
      pollingTimerRef.current = null
    }
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current)
      pollingTimeoutRef.current = null
    }
    setPolling(false)
  }

  const markAsPaid = () => {
    stopPolling()
    setPaymentExpired(false)
    setPaymentSuccess(true)
    setRedirectCountdown(3)
    setErrorMessage('')
  }

  const resetOrderView = () => {
    stopPolling()
    setShowQR(false)
    setCountdown(0)
    setOrderId('')
    setWechatCodeUrl('')
    setPaymentSuccess(false)
    setPaymentExpired(false)
    setErrorMessage('')
  }

  const generateOrderId = () => {
    const date = new Date()
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
    const timeStr = `${date.getTime().toString().slice(-6)}${Math.floor(Math.random() * 900 + 100)}`
    return `ORDER_${dateStr}_${timeStr}`
  }

  const pollOrder = async (targetOrderId: string): Promise<'paid' | 'expired' | 'pending'> => {
    try {
      const res = await fetch(`/api/orders/check?orderId=${targetOrderId}`, { cache: 'no-store' })
      const data = (await res.json()) as CheckOrderResponse

      if (!res.ok) {
        return 'pending'
      }

      if (data.paid || data.status === 'paid') {
        markAsPaid()
        return 'paid'
      }

      if (data.expired || data.status === 'expired') {
        stopPolling()
        setPaymentExpired(true)
        setCountdown(0)
        return 'expired'
      }
    } catch {
      // 避免因偶发网络抖动导致用户误判支付失败。
    }

    return 'pending'
  }

  const startPolling = (targetOrderId: string) => {
    stopPolling()
    setPolling(true)
    pollingTimerRef.current = setInterval(() => {
      void pollOrder(targetOrderId)
    }, 5000)

    pollingTimeoutRef.current = setTimeout(() => {
      stopPolling()
    }, 600000)
  }

  const handleCreateOrder = async () => {
    if (creatingOrder) return

    setErrorMessage('')
    setPaymentSuccess(false)
    setPaymentExpired(false)
    setCreatingOrder(true)
    setWechatCodeUrl('')

    const newOrderId = generateOrderId()

    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: newOrderId,
          paymentMethod,
        }),
      })

      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload.error || '创建订单失败，请稍后重试')
      }

      const createdOrderId = typeof payload?.order?.order_id === 'string' ? payload.order.order_id : newOrderId
      const createdPaymentMethod =
        payload?.order?.payment_method === 'wechat' || payload?.order?.payment_method === 'alipay'
          ? payload.order.payment_method
          : paymentMethod
      const codeUrl = typeof payload?.payment?.codeUrl === 'string' ? payload.payment.codeUrl : ''
      setOrderId(createdOrderId)
      setPaymentMethod(createdPaymentMethod)
      setWechatCodeUrl(codeUrl)
      setShowQR(true)
      setCountdown(secondsUntil(payload?.order?.expires_at))
      const firstCheck = await pollOrder(createdOrderId)
      if (firstCheck === 'pending') {
        startPolling(createdOrderId)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '创建订单失败，请稍后重试'
      setErrorMessage(message)
      setShowQR(false)
      setCountdown(0)
    } finally {
      setCreatingOrder(false)
    }
  }

  useEffect(() => {
    if (countdown <= 0) return

    const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  useEffect(() => {
    if (!paymentSuccess) return

    if (redirectCountdown <= 0) {
      window.location.assign('/membership?payment=success')
      return
    }

    const timer = setTimeout(() => setRedirectCountdown((prev) => prev - 1), 1000)
    return () => clearTimeout(timer)
  }, [paymentSuccess, redirectCountdown])

  useEffect(() => {
    if (!creatingOrder) {
      setLoadingDots(1)
      return
    }

    const timer = setInterval(() => {
      setLoadingDots((prev) => (prev >= 3 ? 1 : prev + 1))
    }, 360)

    return () => clearInterval(timer)
  }, [creatingOrder])

  useEffect(() => {
    return () => {
      stopPolling()
    }
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const stageState: 'loading' | 'success' | 'warning' | 'error' | 'idle' = paymentSuccess
    ? 'success'
    : paymentExpired
      ? 'warning'
      : errorMessage && showQR
        ? 'error'
        : polling
          ? 'loading'
          : 'idle'

  if (!showQR) {
    return (
      <Card className="border-[#c9ddd6] shadow-[0_20px_46px_-30px_rgba(13,59,58,0.45)]">
        <CardHeader className="space-y-3">
          <CardTitle className="text-2xl font-display text-[var(--brand-ink)]">确认支付信息</CardTitle>
          <CardDescription>选择支付方式并生成订单。订单有效期 10 分钟，完成后自动开通会员。</CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              onClick={() => setPaymentMethod('wechat')}
              className={`rounded-2xl border-2 p-4 text-left transition ${
                paymentMethod === 'wechat'
                  ? 'border-[#2db86f] bg-[#ebf8f1]'
                  : 'border-[#d8e6df] bg-white hover:border-[#9bc6b7]'
              }`}
            >
              <Image src="/icons/wechat.svg" alt="微信图标" width={30} height={30} className="mb-2" />
              <div className="font-semibold text-slate-900">微信支付</div>
              <div className="mt-1 text-xs text-slate-500">建议手机扫码完成</div>
            </button>
            <button
              onClick={() => setPaymentMethod('alipay')}
              className={`rounded-2xl border-2 p-4 text-left transition ${
                paymentMethod === 'alipay'
                  ? 'border-[#5aa8ff] bg-[#eef6ff]'
                  : 'border-[#d8e6df] bg-white hover:border-[#9bc6b7]'
              }`}
            >
              <Image src="/icons/alipay.svg" alt="支付宝图标" width={30} height={30} className="mb-2" />
              <div className="font-semibold text-slate-900">支付宝</div>
              <div className="mt-1 text-xs text-slate-500">建议手机扫码完成</div>
            </button>
          </div>

          <div className="rounded-2xl border border-[#d8e6df] bg-[#f6faf8] p-4 text-sm text-slate-600">
            <p>
              当前账号：<span className="font-medium text-slate-800">{userEmail}</span>
            </p>
            <p className="mt-1">
              本次支付金额：<span className="font-semibold text-[var(--brand-fresh)]">¥{MEMBERSHIP_PRICE}</span>
            </p>
          </div>

          <Button
            onClick={handleCreateOrder}
            className="w-full rounded-full bg-[linear-gradient(120deg,#0d3b3a,#3a7d6b)] hover:opacity-95"
            size="lg"
            disabled={creatingOrder}
          >
            {creatingOrder ? `创建订单中${'.'.repeat(loadingDots)}` : `生成支付订单（¥${MEMBERSHIP_PRICE}）`}
          </Button>

          {creatingOrder && (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-[#cfe5dc] bg-[#eff8f3] px-3 py-2 text-sm text-[var(--brand-fresh)]">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              正在初始化支付信息
            </div>
          )}

          <div className="space-y-1 text-center text-xs text-slate-500">
            <p>支付备注请填写订单号，避免到账后无法自动匹配</p>
            <p>系统会在支付完成后自动检测并开通权限</p>
          </div>

          {errorMessage && <p className="text-center text-sm text-red-600">{errorMessage}</p>}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-[#c9ddd6] shadow-[0_20px_46px_-30px_rgba(13,59,58,0.45)]">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl font-display text-[var(--brand-ink)]">扫码支付</CardTitle>
        <CardDescription>请在 10 分钟内完成付款并填写订单号备注。</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
          <section className="rounded-2xl border border-[#d2e4dc] bg-[linear-gradient(165deg,#ffffff,#eef8f3)] p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-800">{PAYMENT_METHOD_TEXT[paymentMethod]}</p>
              <span className="rounded-full border border-[#d8e6df] bg-white px-2.5 py-1 text-xs text-slate-500">扫码付款</span>
            </div>
            <div className="relative mx-auto h-56 w-56 rounded-2xl bg-white p-3 shadow-[inset_0_0_0_1px_rgba(13,59,58,0.08)]">
              {paymentMethod === 'wechat' && wechatCodeUrl ? (
                <Image
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(wechatCodeUrl)}`}
                  alt="微信官方支付二维码"
                  fill
                  unoptimized
                  className="object-contain p-2"
                />
              ) : paymentMethod === 'wechat' ? (
                <Image src="/payment/wechat-qr.png" alt="微信收款码" fill className="object-contain p-2" />
              ) : (
                <Image src="/payment/alipay-qr.png" alt="支付宝收款码" fill className="object-contain p-2" />
              )}
            </div>
            <p className="mt-3 text-center text-xs text-slate-500">请打开手机 {PAYMENT_METHOD_TEXT[paymentMethod]} 扫码</p>
          </section>

          <section className="space-y-4">
            <StatusBanner state={stageState} redirectCountdown={redirectCountdown} />

            <div className="grid gap-3 sm:grid-cols-2">
              <article className="rounded-2xl border border-[#d8e6df] bg-white p-4">
                <p className="text-xs uppercase tracking-[0.15em] text-slate-500">金额</p>
                <p className="mt-1 text-3xl font-display text-[var(--brand-fresh)]">¥{MEMBERSHIP_PRICE}</p>
              </article>
              <article className="rounded-2xl border border-[#d8e6df] bg-white p-4">
                <p className="text-xs uppercase tracking-[0.15em] text-slate-500">剩余时间</p>
                <p className="mt-1 text-3xl font-display text-[var(--brand-ink)]">
                  {paymentSuccess ? '已支付' : countdown > 0 ? formatTime(countdown) : '已过期'}
                </p>
              </article>
            </div>

            <article className="rounded-2xl border border-[#f0d88d] bg-[#fff9e8] p-4">
              <p className="text-sm font-semibold text-slate-900">订单信息</p>
              <p className="mt-2 text-xs text-slate-600">订单编号（支付备注必填）</p>
              <p className="mt-1 break-all rounded-lg bg-white px-2 py-1.5 font-mono text-xs text-slate-900">{orderId}</p>
              <p className="mt-2 text-sm font-semibold text-red-600">请务必在支付备注中填写订单编号</p>
            </article>

            {paymentSuccess ? (
              <Button
                onClick={() => {
                  window.location.assign('/membership?payment=success')
                }}
                className="w-full rounded-full bg-[linear-gradient(120deg,#0d3b3a,#3a7d6b)] hover:opacity-95"
              >
                立即查看会员状态
              </Button>
            ) : (
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button variant="outline" onClick={resetOrderView} className="flex-1">
                  返回重选
                </Button>
                <Button
                  onClick={resetOrderView}
                  className="flex-1 rounded-full bg-[linear-gradient(120deg,#0d3b3a,#3a7d6b)] hover:opacity-95"
                >
                  重新生成订单
                </Button>
              </div>
            )}

            <p className="text-xs text-slate-500">如支付成功 1 分钟后仍未开通，请保留订单号并联系客服处理。</p>

            {errorMessage && <p className="text-center text-sm text-red-600">{errorMessage}</p>}
          </section>
        </div>
      </CardContent>
    </Card>
  )
}
