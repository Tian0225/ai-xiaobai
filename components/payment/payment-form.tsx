'use client'

import { useEffect, useRef, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface PaymentFormProps {
  userEmail: string
}

const MEMBERSHIP_PRICE = Number(process.env.NEXT_PUBLIC_MEMBERSHIP_PRICE ?? 499)
const PAYMENT_METHOD_TEXT = {
  wechat: '微信支付',
  alipay: '支付宝支付',
} as const

export default function PaymentForm({ userEmail }: PaymentFormProps) {
  const [orderId, setOrderId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'wechat' | 'alipay'>('wechat')
  const [showQR, setShowQR] = useState(false)
  const [polling, setPolling] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [redirectCountdown, setRedirectCountdown] = useState(3)
  const [loadingDots, setLoadingDots] = useState(1)
  const [creatingOrder, setCreatingOrder] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
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
    setPaymentSuccess(true)
    setRedirectCountdown(3)
  }

  // 生成订单号
  const generateOrderId = () => {
    const date = new Date()
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
    const timeStr = date.getTime().toString().slice(-6)
    return `ORDER_${dateStr}_${timeStr}`
  }

  // 创建订单
  const handleCreateOrder = async () => {
    setErrorMessage('')
    setPaymentSuccess(false)
    setCreatingOrder(true)
    const newOrderId = generateOrderId()
    setOrderId(newOrderId)

    try {
      // 调用 API 创建订单
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: newOrderId,
          paymentMethod,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || '创建订单失败，请稍后重试')
      }

      setShowQR(true)
      setCountdown(600) // 10分钟倒计时

      // 开始轮询检查支付状态
      startPolling(newOrderId)
    } catch (error) {
      const message = error instanceof Error ? error.message : '创建订单失败，请稍后重试'
      setErrorMessage(message)
      setShowQR(false)
      setCountdown(0)
    } finally {
      setCreatingOrder(false)
    }
  }

  // 开始轮询
  const startPolling = (orderId: string) => {
    setPolling(true)
    pollingTimerRef.current = setInterval(async () => {
      const res = await fetch(`/api/orders/check?orderId=${orderId}`, { cache: 'no-store' })
      const data = await res.json()

      if (data.paid || data.isMember) {
        markAsPaid()
      }
      if (data.expired) {
        stopPolling()
      }
    }, 5000) // 每5秒检查一次

    // 10分钟后停止轮询
    pollingTimeoutRef.current = setTimeout(() => {
      stopPolling()
    }, 600000)
  }

  // 倒计时
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  useEffect(() => {
    if (!paymentSuccess) return

    if (redirectCountdown <= 0) {
      window.location.href = '/membership?payment=success'
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

  if (!showQR) {
    return (
      <Card className="border-[#c9ddd6] shadow-[0_20px_46px_-30px_rgba(13,59,58,0.45)]">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-display text-[var(--brand-ink)]">选择支付方式</CardTitle>
          <CardDescription>支持微信和支付宝，推荐手机扫码完成支付。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              onClick={() => setPaymentMethod('wechat')}
              className={`rounded-2xl border-2 p-4 text-left transition ${paymentMethod === 'wechat'
                  ? 'border-[#2db86f] bg-[#ebf8f1]'
                  : 'border-[#d8e6df] bg-white hover:border-[#9bc6b7]'
                }`}
            >
              <Image src="/icons/wechat.svg" alt="微信图标" width={30} height={30} className="mb-2" />
              <div className="font-semibold text-slate-900">微信支付</div>
              <div className="mt-1 text-xs text-slate-500">扫码后在备注里填写订单号</div>
            </button>
            <button
              onClick={() => setPaymentMethod('alipay')}
              className={`rounded-2xl border-2 p-4 text-left transition ${paymentMethod === 'alipay'
                  ? 'border-[#5aa8ff] bg-[#eef6ff]'
                  : 'border-[#d8e6df] bg-white hover:border-[#9bc6b7]'
                }`}
            >
              <Image src="/icons/alipay.svg" alt="支付宝图标" width={30} height={30} className="mb-2" />
              <div className="font-semibold text-slate-900">支付宝</div>
              <div className="mt-1 text-xs text-slate-500">扫码后在备注里填写订单号</div>
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
            {creatingOrder ? `创建订单中${'.'.repeat(loadingDots)}` : `创建订单并展示收款码（¥${MEMBERSHIP_PRICE}）`}
          </Button>

          <div className="space-y-1 text-center text-xs text-slate-500">
            <p>生成后有效期 10 分钟</p>
            <p>支付后系统自动检测，若人工核销成功会自动提示支付成功</p>
          </div>

          {errorMessage && (
            <p className="text-sm text-red-600 text-center">{errorMessage}</p>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-[#c9ddd6] shadow-[0_20px_46px_-30px_rgba(13,59,58,0.45)]">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl font-display text-[var(--brand-ink)]">扫码支付</CardTitle>
        <CardDescription>请在 10 分钟内完成支付并备注订单号。</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
          <section className="rounded-2xl border border-[#d2e4dc] bg-[linear-gradient(165deg,#ffffff,#eef8f3)] p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-800">{PAYMENT_METHOD_TEXT[paymentMethod]}</p>
              <span className="rounded-full border border-[#d8e6df] bg-white px-2.5 py-1 text-xs text-slate-500">
                扫码付款
              </span>
            </div>
            <div className="relative mx-auto h-56 w-56 rounded-2xl bg-white p-3 shadow-[inset_0_0_0_1px_rgba(13,59,58,0.08)]">
              {paymentMethod === 'wechat' ? (
                <Image src="/payment/wechat-qr.png" alt="微信收款码" fill className="object-contain p-2" />
              ) : (
                <Image src="/payment/alipay-qr.png" alt="支付宝收款码" fill className="object-contain p-2" />
              )}
            </div>
            <p className="mt-3 text-center text-xs text-slate-500">请打开手机 {PAYMENT_METHOD_TEXT[paymentMethod]} 扫码</p>
          </section>

          <section className="space-y-4">
            {paymentSuccess && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  支付成功，会员已开通
                </p>
                <p className="mt-2 text-sm text-emerald-700">
                  {redirectCountdown} 秒后自动跳转到会员状态页...
                </p>
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <article className="rounded-2xl border border-[#d8e6df] bg-white p-4">
                <p className="text-xs uppercase tracking-[0.15em] text-slate-500">金额</p>
                <p className="mt-1 text-3xl font-display text-[var(--brand-fresh)]">¥{MEMBERSHIP_PRICE}</p>
              </article>
              <article className="rounded-2xl border border-[#d8e6df] bg-white p-4">
                <p className="text-xs uppercase tracking-[0.15em] text-slate-500">剩余时间</p>
                <p className="mt-1 text-3xl font-display text-[var(--brand-ink)]">
                  {paymentSuccess ? "已支付" : countdown > 0 ? formatTime(countdown) : "已过期"}
                </p>
              </article>
            </div>

            <article className="rounded-2xl border border-[#f0d88d] bg-[#fff9e8] p-4">
              <p className="text-sm font-semibold text-slate-900">订单信息</p>
              <p className="mt-2 text-xs text-slate-600">订单编号（备注必填）</p>
              <p className="mt-1 break-all rounded-lg bg-white px-2 py-1.5 font-mono text-xs text-slate-900">{orderId}</p>
              <p className="mt-2 text-sm font-semibold text-red-600">请务必在支付备注中填写订单编号</p>
            </article>

            {polling ? (
              <div className="flex items-center gap-2 rounded-xl border border-[#bfe2d2] bg-[#eef8f3] px-3 py-2 text-sm text-[var(--brand-fresh)]">
                <div className="h-4 w-4 rounded-full border-2 border-[var(--brand-fresh)] border-t-transparent animate-spin" />
                正在检测支付状态...
              </div>
            ) : paymentSuccess ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                检测到支付成功，正在跳转...
              </div>
            ) : (
              <div className="rounded-xl border border-[#d8e6df] bg-white px-3 py-2 text-sm text-slate-600">
                系统每 5 秒自动检测一次支付状态
              </div>
            )}

            {paymentSuccess ? (
              <Button
                onClick={() => {
                  window.location.href = '/membership?payment=success'
                }}
                className="w-full rounded-full bg-[linear-gradient(120deg,#0d3b3a,#3a7d6b)] hover:opacity-95"
              >
                立即查看会员状态
              </Button>
            ) : (
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowQR(false)
                    setCountdown(0)
                    stopPolling()
                  }}
                  className="flex-1"
                >
                  取消订单
                </Button>
                <Button
                  onClick={() => {
                    setShowQR(false)
                    setCountdown(0)
                    stopPolling()
                  }}
                  className="flex-1 rounded-full bg-[linear-gradient(120deg,#0d3b3a,#3a7d6b)] hover:opacity-95"
                >
                  重新生成
                </Button>
              </div>
            )}
          </section>
        </div>

        {errorMessage && (
          <p className="mt-4 text-center text-sm text-red-600">{errorMessage}</p>
        )}
      </CardContent>
    </Card>
  )
}
