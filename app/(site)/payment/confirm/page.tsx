'use client'

import { useState } from 'react'
import { CheckCircle2, LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

const PAYMENT_METHODS = [
  {
    value: 'wechat' as const,
    label: '微信支付',
    shortLabel: 'WX',
    hint: '推荐个人支付场景',
    color: 'uipro-pay-loading',
  },
  {
    value: 'alipay' as const,
    label: '支付宝',
    shortLabel: 'ALI',
    hint: '支持企业与个人账户',
    color: 'uipro-pay-loading',
  },
]

interface ConfirmResult {
  success: boolean
  order?: {
    order_id: string
    amount: number
  }
  message?: string
}

export default function PaymentConfirmPage() {
  const [orderId, setOrderId] = useState('')
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'wechat' | 'alipay'>('wechat')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<ConfirmResult | null>(null)

  const handleSubmit = async () => {
    if (!orderId || !amount) {
      setResult({ success: false, message: '请先填写订单号和支付金额' })
      return
    }

    setSubmitting(true)
    setResult(null)

    try {
      const response = await fetch('/api/payment/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderId.trim(),
          amount: Number.parseFloat(amount),
          paymentMethod,
        }),
      })

      const data = (await response.json()) as ConfirmResult
      setResult(data)
    } catch {
      setResult({ success: false, message: '提交失败，请检查网络后重试' })
    } finally {
      setSubmitting(false)
    }
  }

  if (result?.success) {
    return (
      <main className="uipro-pay-canvas min-h-screen px-4 py-28">
        <div className="layout-grid max-w-md">
          <Card className="uipro-pay-success border-none">
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/80">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <CardTitle className="text-2xl font-display">支付确认成功</CardTitle>
              <CardDescription className="text-current/80">订单已进入自动核验流程，会员权限将自动开通。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <div className="rounded-2xl bg-white/70 p-4 text-sm">
                <p>
                  订单号：<span className="font-mono font-semibold">{result.order?.order_id}</span>
                </p>
                <p className="mt-1">
                  支付金额：<span className="font-semibold">¥{result.order?.amount}</span>
                </p>
              </div>

              <Button className="uipro-pay-loading w-full rounded-full" asChild>
                <a href="/membership">返回会员页面查看状态</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="uipro-pay-canvas min-h-screen px-4 py-24">
      <div className="layout-grid max-w-md">
        <Card className="uipro-pay-surface border-none">
          <CardHeader>
            <CardTitle className="text-2xl font-display text-[var(--uipro-pay-text)]">确认支付</CardTitle>
            <CardDescription>
              填写支付信息后，系统会自动核验并开通会员权限。
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form
              onSubmit={(event) => {
                event.preventDefault()
                void handleSubmit()
              }}
              className="space-y-5"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="orderId">
                  订单号
                </label>
                <Input
                  id="orderId"
                  type="text"
                  placeholder="例如：MEM_20260216_ABCDEFG"
                  value={orderId}
                  onChange={(event) => setOrderId(event.target.value)}
                  disabled={submitting}
                  required
                  autoComplete="off"
                />
                <p className="text-xs text-slate-500">
                  请填写支付时备注的订单号，建议复制粘贴避免输错。
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="amount">
                  支付金额（元）
                </label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="例如：499"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  disabled={submitting}
                  required
                  autoComplete="off"
                />
                <p className="text-xs text-slate-500">请填写实际支付金额。</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">支付方式</label>
                <div className="grid grid-cols-2 gap-3">
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() => setPaymentMethod(method.value)}
                      disabled={submitting}
                      className={`rounded-xl border p-3 text-left transition ${
                        paymentMethod === method.value
                          ? method.color
                          : 'border-[color-mix(in_oklab,var(--uipro-pay-secondary)_24%,white)] bg-white hover:bg-[color-mix(in_oklab,var(--uipro-pay-secondary)_8%,white)]'
                      }`}
                    >
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-[11px] font-semibold text-[var(--uipro-pay-text)]">
                        {method.shortLabel}
                      </span>
                      <span className="mt-2 block text-sm font-semibold text-slate-900">{method.label}</span>
                      <span className="mt-1 block text-xs text-slate-500">{method.hint}</span>
                    </button>
                  ))}
                </div>
              </div>

              {result?.success === false && (
                <div className="uipro-pay-error rounded-xl p-4 text-sm" aria-live="polite">
                  <p className="font-semibold">提交失败</p>
                  <p className="mt-1">{result.message ?? '请检查信息后重试'}</p>
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                className="uipro-pay-loading w-full rounded-full"
                disabled={submitting || !orderId || !amount}
              >
                {submitting ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    提交中...
                  </>
                ) : (
                  '确认支付信息'
                )}
              </Button>

              <div className="uipro-pay-surface rounded-xl p-4 text-sm text-slate-700">
                <p className="mb-2 font-semibold text-[var(--uipro-pay-text)]">操作步骤</p>
                <ol className="list-decimal space-y-1 pl-5 text-slate-600">
                  <li>先完成扫码支付并记录订单号。</li>
                  <li>回到此页面填写订单号、支付金额与支付方式。</li>
                  <li>提交后系统会自动核验状态并开通会员。</li>
                </ol>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
