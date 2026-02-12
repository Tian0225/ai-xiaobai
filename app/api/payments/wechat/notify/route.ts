import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { fulfillPaidOrder } from '@/lib/order-fulfillment'
import { parseVerifiedWechatPayNotify } from '@/lib/payment/wechat-official'

function wechatAck(status = 200) {
  return NextResponse.json({ code: 'SUCCESS', message: '成功' }, { status })
}

export async function POST(request: NextRequest) {
  let rawBody = ''

  try {
    rawBody = await request.text()
    const transaction = await parseVerifiedWechatPayNotify(rawBody, request.headers)

    const outTradeNo = String(transaction.out_trade_no || '').trim()
    const transactionId = String(transaction.transaction_id || '').trim()
    const tradeState = String(transaction.trade_state || '').trim().toUpperCase()
    const successTime = typeof transaction.success_time === 'string' ? transaction.success_time : undefined

    if (!outTradeNo || !transactionId) {
      console.error('微信回调缺少交易关键字段', {
        outTradeNo,
        transactionId,
      })
      return wechatAck()
    }

    if (tradeState !== 'SUCCESS') {
      // 非成功支付状态不落库，返回成功避免微信反复推送。
      return wechatAck()
    }

    const paidAt = (() => {
      if (!successTime) return new Date().toISOString()
      const date = new Date(successTime)
      if (Number.isNaN(date.getTime())) return new Date().toISOString()
      return date.toISOString()
    })()

    const result = await fulfillPaidOrder(createAdminClient(), {
      orderId: outTradeNo,
      transactionId,
      paidAtIso: paidAt,
    })

    if (!result.success && result.status === 'not_found') {
      console.error('微信回调订单不存在', {
        orderId: outTradeNo,
        transactionId,
      })
      return wechatAck()
    }

    if (!result.success && result.status && result.status !== 'rollback') {
      console.error('微信回调订单状态非法', {
        orderId: outTradeNo,
        transactionId,
        message: result.error,
      })
      return wechatAck()
    }

    if (!result.success) {
      console.error('微信回调处理失败', {
        orderId: outTradeNo,
        transactionId,
        message: result.error,
        rollbackSucceeded: result.rollbackSucceeded,
      })
      return wechatAck(500)
    }

    return wechatAck()
  } catch (error) {
    console.error('微信支付回调异常', error)
    return wechatAck(500)
  }
}
