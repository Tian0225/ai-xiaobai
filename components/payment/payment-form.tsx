'use client'

import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface PaymentFormProps {
  userEmail: string
}

const MEMBERSHIP_PRICE = Number(process.env.NEXT_PUBLIC_MEMBERSHIP_PRICE ?? 499)

export default function PaymentForm({ userEmail }: PaymentFormProps) {
  const [orderId, setOrderId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'wechat' | 'alipay'>('wechat')
  const [showQR, setShowQR] = useState(false)
  const [polling, setPolling] = useState(false)
  const [countdown, setCountdown] = useState(0)
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
      const res = await fetch(`/api/orders/check?orderId=${orderId}`)
      const data = await res.json()

      if (data.paid) {
        stopPolling()
        // 支付成功，刷新页面
        window.location.reload()
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
      <Card>
        <CardHeader>
          <CardTitle>选择支付方式</CardTitle>
          <CardDescription>支持微信和支付宝</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setPaymentMethod('wechat')}
              className={`p-4 border-2 rounded-lg transition ${paymentMethod === 'wechat'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
                }`}
            >
              <div className="text-2xl mb-2">💚</div>
              <div className="font-semibold">微信支付</div>
            </button>
            <button
              onClick={() => setPaymentMethod('alipay')}
              className={`p-4 border-2 rounded-lg transition ${paymentMethod === 'alipay'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
                }`}
            >
              <div className="text-2xl mb-2">💙</div>
              <div className="font-semibold">支付宝</div>
            </button>
          </div>

          <Button onClick={handleCreateOrder} className="w-full" size="lg" disabled={creatingOrder}>
            {creatingOrder ? '生成中...' : `生成收款码（¥${MEMBERSHIP_PRICE}）`}
          </Button>

          <div className="text-xs text-gray-500 text-center space-y-1">
            <p>点击后将生成专属收款码</p>
            <p>支付时请务必填写订单备注</p>
            <p>当前账户：{userEmail}</p>
          </div>

          {errorMessage && (
            <p className="text-sm text-red-600 text-center">{errorMessage}</p>
          )}
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
          <div className="relative aspect-square w-full max-w-xs mx-auto bg-white rounded overflow-hidden">
            {paymentMethod === 'wechat' ? (
              <Image
                src="/payment/wechat-qr.png"
                alt="微信收款码"
                fill
                className="object-contain p-2"
              />
            ) : (
              <Image
                src="/payment/alipay-qr.png"
                alt="支付宝收款码"
                fill
                className="object-contain p-2"
              />
            )}
          </div>
        </div>

        {/* 订单信息 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="font-semibold text-sm mb-2">⚠️ 重要提示</div>
          <div className="text-sm space-y-1">
            <p>支付金额：<span className="font-bold text-red-600">¥{MEMBERSHIP_PRICE}</span></p>
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
            setCountdown(0)
            stopPolling()
          }}
          className="w-full"
        >
          取消订单
        </Button>
      </CardContent>
    </Card>
  )
}
