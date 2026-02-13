import { createClient } from '@/lib/supabase/server'
import { createWechatNativeOrder, yuanToFen } from '@/lib/payment/wechat-official'
import { getServerPaymentMode, isOfficialPaymentMode } from '@/lib/payment/mode'
import { getOrderBizConfig, parseOrderBizType } from '@/lib/order-biz'
import { NextRequest, NextResponse } from 'next/server'

const PAYMENT_METHODS = ['wechat', 'alipay'] as const
const OFFICIAL_ORDER_EXPIRE_MINUTES = Number(process.env.ORDER_EXPIRE_MINUTES_OFFICIAL ?? 10)
const MANUAL_ORDER_EXPIRE_MINUTES = Number(process.env.ORDER_EXPIRE_MINUTES_MANUAL ?? 1440)

type PaymentMethod = (typeof PAYMENT_METHODS)[number]

type OrderRow = {
  order_id: string
  amount: number
  payment_method: PaymentMethod
  [key: string]: unknown
}

function toJsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

function resolveExpireMinutes(mode: 'manual' | 'official') {
  const candidate = mode === 'official' ? OFFICIAL_ORDER_EXPIRE_MINUTES : MANUAL_ORDER_EXPIRE_MINUTES
  return Number.isFinite(candidate) && candidate > 0 ? candidate : mode === 'official' ? 10 : 1440
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const orderId = typeof body.orderId === 'string' ? body.orderId.trim() : ''
    const paymentMethod = body.paymentMethod as PaymentMethod
    const bizType = parseOrderBizType(body.bizType)
    const bizConfig = getOrderBizConfig(bizType)

    if (!orderId || !paymentMethod) {
      return toJsonError('缺少必要参数', 400)
    }
    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      return toJsonError('支付方式无效', 400)
    }
    if (!Number.isFinite(bizConfig.amountYuan) || bizConfig.amountYuan <= 0) {
      return toJsonError('订单金额配置错误', 500)
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return toJsonError('未登录', 401)
    }
    if (!user.email) {
      return toJsonError('用户邮箱缺失', 400)
    }

    const now = new Date()
    const nowIso = now.toISOString()

    // 幂等处理：同一用户已有未过期 pending 订单时复用，避免重复点击产生多笔订单。
    const { data: activePendingOrder, error: pendingQueryError } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .eq('payment_method', paymentMethod)
      .eq('amount', bizConfig.amountYuan)
      .gt('expires_at', nowIso)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (pendingQueryError) {
      console.error('查询待支付订单失败:', pendingQueryError)
      return toJsonError('创建订单失败', 500)
    }

    let order: OrderRow
    let reused = false
    const paymentMode = getServerPaymentMode()
    const resolvedMode: 'manual' | 'official' =
      paymentMethod === 'wechat' && isOfficialPaymentMode(paymentMode) ? 'official' : 'manual'
    const orderExpireMinutes = resolveExpireMinutes(resolvedMode)

    if (activePendingOrder) {
      order = activePendingOrder as unknown as OrderRow
      reused = true
    } else {
      const expiresAt = new Date(now.getTime() + orderExpireMinutes * 60 * 1000).toISOString()

      const { data, error } = await supabase
        .from('orders')
        .insert({
          order_id: orderId,
          user_id: user.id,
          user_email: user.email,
          amount: bizConfig.amountYuan,
          payment_method: paymentMethod,
          status: 'pending',
          created_at: nowIso,
          expires_at: expiresAt,
        })
        .select()
        .single()

      if (error) {
        const duplicateErrorCode = '23505'
        const maybeCode = typeof error === 'object' && error && 'code' in error ? String(error.code) : ''

        if (maybeCode === duplicateErrorCode) {
          const { data: existed } = await supabase
            .from('orders')
            .select('*')
            .eq('order_id', orderId)
            .eq('user_id', user.id)
            .maybeSingle()

          if (existed) {
            order = existed as unknown as OrderRow
            reused = true
          } else {
            console.error('创建订单失败:', error)
            return toJsonError('创建订单失败', 500)
          }
        } else {
          console.error('创建订单失败:', error)
          return toJsonError('创建订单失败', 500)
        }
      } else {
        order = data as unknown as OrderRow
      }
    }

    if (paymentMethod === 'wechat' && resolvedMode === 'official') {
      try {
        const amountFen = yuanToFen(Number(order.amount))
        const description = process.env.WECHAT_PAY_ORDER_DESC?.trim() || `AI-xiaobai ${bizConfig.label}`
        const wechatOrder = await createWechatNativeOrder({
          outTradeNo: order.order_id,
          amountFen,
          description,
          attach: order.order_id,
        })

        return NextResponse.json({
          success: true,
          order,
          reused,
          payment: {
            method: 'wechat',
            mode: 'official',
            codeUrl: wechatOrder.codeUrl,
            prepayId: wechatOrder.prepayId ?? null,
          },
          manualReviewRequired: false,
        })
      } catch (wechatError) {
        console.error('微信官方下单失败:', wechatError)
        return toJsonError('微信官方下单失败，请稍后重试', 502)
      }
    }

    return NextResponse.json({
      success: true,
      order,
      reused,
      payment: {
        method: paymentMethod,
        mode: resolvedMode,
        codeUrl: null,
        prepayId: null,
      },
      manualReviewRequired: true,
    })
  } catch (error) {
    console.error('订单创建错误:', error)
    return toJsonError('服务器错误', 500)
  }
}
