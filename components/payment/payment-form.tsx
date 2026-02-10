'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface PaymentFormProps {
  userEmail: string
}

export default function PaymentForm({ userEmail }: PaymentFormProps) {
  const [orderId, setOrderId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'wechat' | 'alipay'>('wechat')
  const [showQR, setShowQR] = useState(false)
  const [polling, setPolling] = useState(false)
  const [countdown, setCountdown] = useState(0)

  // 生成订单号
  const generateOrderId = () => {
    const date = new Date()
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
    const timeStr = date.getTime().toString().slice(-6)
    return `ORDER_${dateStr}_${timeStr}`
  }

  // 创建订单
  const handleCreateOrder = async () => {
    const newOrderId = generateOrderId()
    setOrderId(newOrderId)
    setShowQR(true)
    setCountdown(600) // 10分钟倒计时

    // 调用 API 创建订单
    await fetch('/api/orders/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: newOrderId,
        amount: 499,
        userEmail,
        paymentMethod,
      }),
    })

    // 开始轮询检查支付状态
    startPolling(newOrderId)
  }

  // 开始轮询
  const startPolling = (orderId: string) => {
    setPolling(true)
    const interval = setInterval(async () => {
      const res = await fetch(`/api/orders/check?orderId=${orderId}`)
      const data = await res.json()

      if (data.paid) {
        clearInterval(interval)
        setPolling(false)
        // 支付成功，刷新页面
        window.location.reload()
      }
    }, 5000) // 每5秒检查一次

    // 10分钟后停止轮询
    setTimeout(() => {
      clearInterval(interval)
      setPolling(false)
    }, 600000)
  }

  // 倒计时
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!showQR) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>选择支付方式</CardTitle>
          <CardDescription>支持微信和支付宝</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setPaymentMethod('wechat')}
              className={`p-4 border-2 rounded-lg transition ${
                paymentMethod === 'wechat'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">💚</div>
              <div className="font-semibold">微信支付</div>
            </button>
            <button
              onClick={() => setPaymentMethod('alipay')}
              className={`p-4 border-2 rounded-lg transition ${
                paymentMethod === 'alipay'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">💙</div>
              <div className="font-semibold">支付宝</div>
            </button>
          </div>

          <Button onClick={handleCreateOrder} className="w-full" size="lg">
            生成收款码（¥499）
          </Button>

          <div className="text-xs text-gray-500 text-center space-y-1">
            <p>点击后将生成专属收款码</p>
            <p>支付时请务必填写订单备注</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>扫码支付</CardTitle>
        <CardDescription>
          {polling ? '正在检测支付...' : '请使用手机扫码支付'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 收款码 */}
        <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-300">
          <div className="relative aspect-square w-full max-w-xs mx-auto bg-gray-100 rounded flex items-center justify-center">
            {paymentMethod === 'wechat' ? (
              <div className="text-center">
                <div className="text-4xl mb-2">💚</div>
                <div className="text-sm text-gray-500">微信收款码</div>
                <div className="text-xs text-gray-400 mt-2">请在 public/payment/ 放置真实收款码</div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-4xl mb-2">💙</div>
                <div className="text-sm text-gray-500">支付宝收款码</div>
                <div className="text-xs text-gray-400 mt-2">请在 public/payment/ 放置真实收款码</div>
              </div>
            )}
          </div>
        </div>

        {/* 订单信息 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="font-semibold text-sm mb-2">⚠️ 重要提示</div>
          <div className="text-sm space-y-1">
            <p>支付金额：<span className="font-bold text-red-600">¥499</span></p>
            <p>订单编号：<span className="font-mono text-xs bg-white px-2 py-1 rounded">{orderId}</span></p>
            <p className="text-red-600 font-semibold">请务必在支付备注中填写订单编号！</p>
          </div>
        </div>

        {/* 倒计时 */}
        <div className="text-center">
          <div className="text-sm text-gray-600">
            {countdown > 0 ? (
              <>订单有效期：<span className="font-mono font-semibold">{formatTime(countdown)}</span></>
            ) : (
              <span className="text-red-600">订单已过期，请重新生成</span>
            )}
          </div>
        </div>

        {/* 状态指示 */}
        {polling && (
          <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span>正在检测支付，请稍候...</span>
          </div>
        )}

        <Button
          variant="outline"
          onClick={() => {
            setShowQR(false)
            setPolling(false)
            setCountdown(0)
          }}
          className="w-full"
        >
          取消订单
        </Button>
      </CardContent>
    </Card>
  )
}
