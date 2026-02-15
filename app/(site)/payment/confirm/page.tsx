'use client'

import { useState } from 'react'
import { AlertCircle, CheckCircle2, LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

const PAYMENT_METHODS = [
  { value: 'wechat', label: '微信支付', icon: '💬', color: 'bg-[#ebf8f1] border-[#d8e6df]' },
  { value: 'alipay', label: '支付宝', icon: '🔵', color: 'bg-[#eef6ff] border-[#d8e6df]' },
] as const

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
      setResult({ success: false })
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
      setResult({ success: false })
    } finally {
      setSubmitting(false)
    }
  }

  if (result?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-display text-[var(--brand-ink)]">
              ✓ 订单已创建
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
              <p className="mt-3 text-emerald-900 font-semibold">订单创建成功</p>
              <p className="text-sm text-emerald-700">
                订单号：<span className="font-mono font-semibold">{result.order?.order_id}</span>
              </p>
              <p className="text-sm text-emerald-700">
                支付金额：<span className="font-semibold">¥{result.order?.amount}</span>
              </p>
            </div>

            <div className="space-y-4 text-center">
              <p className="text-slate-700">
                系统正在自动检测支付状态，检测成功后将自动为您开通会员。
              </p>
              <p className="text-sm text-slate-600">
                请稍候或刷新会员页面查看状态...
              </p>
              <Button className="w-full" asChild>
                <a href="/membership">返回会员页面</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-display text-[var(--brand-ink)]">
            确认支付
          </CardTitle>
          <CardDescription>
            请填写你的支付信息，系统将自动检测并开通会员。
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="orderId">
                订单号
              </label>
              <Input
                id="orderId"
                type="text"
                placeholder="例如：ORDER_20260214_xxxxxxxx"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                disabled={submitting}
                required
              />
              <p className="text-xs text-slate-500">
                请输入你在支付时填写的订单号备注
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
                placeholder="例如：1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={submitting}
                required
              />
              <p className="text-xs text-slate-500">请填写实际支付金额</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">支付方式</label>
              <div className="grid grid-cols-2 gap-3">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => setPaymentMethod(method.value as 'wechat' | 'alipay')}
                    disabled={submitting}
                    className={`rounded-xl border-2 p-3 text-left transition ${
                      paymentMethod === method.value
                        ? method.color
                        : 'border-[#d8e6df] bg-white hover:bg-[#f8fbf9]'
                    }`}
                  >
                    <span className="text-xl">{method.icon}</span>
                    <span className="font-medium">{method.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {result?.success === false && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                <p className="font-semibold">提交失败，请检查信息后重试</p>
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={submitting || !orderId || !amount}
            >
              {submitting ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  提交中...
                </>
              ) : (
                '确认支付'
              )}
            </Button>

            <div className="rounded-xl border border-[#d8e6df] bg-[#f8fbf9] p-4 text-sm text-slate-700">
              <p className="font-semibold mb-2">💡 使用说明</p>
              <ol className="list-decimal list-inside space-y-1 text-slate-600">
                <li className="flex gap-2">
                  <strong>步骤 1：</strong>扫描二维码，选择对应支付方式完成支付
                </li>
                <li className="flex gap-2">
                  <strong>步骤 2：</strong>在支付备注中填写你的订单号（任意生成即可）
                </li>
                <li className="flex gap-2">
                  <strong>步骤 3：</strong>支付完成后，在此页面填写订单号和金额
                </li>
                <li className="flex gap-2">
                  <strong>步骤 4：</strong>系统将自动检测支付状态并开通会员
                </li>
              </ol>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
