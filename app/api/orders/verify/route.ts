import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminEmail } from '@/lib/auth/admin'
import { createClient } from '@/lib/supabase/server'
import { fulfillPaidOrder } from '@/lib/order-fulfillment'
import { NextRequest, NextResponse } from 'next/server'
import { writeAdminOperationLog } from '@/lib/admin-operation-log'

const PAYMENT_VERIFY_TOKEN = process.env.PAYMENT_VERIFY_TOKEN

async function verifyCallerPermission(request: NextRequest) {
  const authHeader = request.headers.get('x-payment-verify-token')

  if (PAYMENT_VERIFY_TOKEN && authHeader === PAYMENT_VERIFY_TOKEN) {
    return { ok: true as const, actorEmail: 'system:payment-verify-token' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      ok: false as const,
      status: 401,
      error: '请先登录',
    }
  }

  if (!isAdminEmail(user.email)) {
    return {
      ok: false as const,
      status: 403,
      error: '无权限调用验证接口',
    }
  }

  return { ok: true as const, actorEmail: user.email }
}

// 支持两种调用方式：
// 1. 管理员后台登录后人工确认
// 2. 携带 x-payment-verify-token 的服务端调用
export async function POST(request: NextRequest) {
  try {
    const permission = await verifyCallerPermission(request)
    if (!permission.ok) {
      return NextResponse.json({ error: permission.error }, { status: permission.status })
    }
    const actorEmail = permission.actorEmail ?? 'system:unknown'

    const body = await request.json()
    const orderId = typeof body.orderId === 'string' ? body.orderId.trim() : ''
    const transactionId = typeof body.transactionId === 'string' ? body.transactionId.trim() : ''

    if (!orderId) {
      return NextResponse.json({ error: '缺少订单号' }, { status: 400 })
    }

    const paidAtIso = new Date().toISOString()
    const safeTransactionId = transactionId || `MANUAL_${Date.now()}_${orderId}`

    const supabase = createAdminClient()
    const result = await fulfillPaidOrder(supabase, {
      orderId,
      transactionId: safeTransactionId,
      paidAtIso,
    })

    if (!result.success) {
      await writeAdminOperationLog(supabase, request, actorEmail, 'order_verify', {
        targetOrderId: orderId,
        result: 'failed',
        detail: {
          reason: result.error ?? '确认支付失败',
          status: result.status,
          rollbackSucceeded: result.rollbackSucceeded ?? null,
        },
      })

      const statusCode = result.status === 'not_found' ? 404 : result.status === 'rollback' ? 500 : 409
      return NextResponse.json(
        {
          error: result.error || '确认支付失败',
          orderId,
          rollbackSucceeded: result.rollbackSucceeded,
        },
        { status: statusCode }
      )
    }

    if (result.idempotent) {
      await writeAdminOperationLog(supabase, request, actorEmail, 'order_verify', {
        targetOrderId: orderId,
        result: 'success',
        detail: {
          idempotent: true,
          transactionId: safeTransactionId,
        },
      })

      return NextResponse.json({
        success: true,
        idempotent: true,
        message: '订单已支付（幂等命中）',
      })
    }

    await writeAdminOperationLog(supabase, request, actorEmail, 'order_verify', {
      targetOrderId: orderId,
      result: 'success',
      detail: {
        idempotent: false,
        transactionId: safeTransactionId,
        grantType: result.grantType ?? 'membership',
        membershipExpiresAt: result.membershipExpiresAt ?? null,
        tokenGranted: result.tokenGranted ?? null,
        tokenBalance: result.tokenBalance ?? null,
      },
    })

    const successMessage =
      result.grantType === 'token'
        ? `支付成功，已发放代币 ${result.tokenGranted ?? 0}`
        : '支付成功，会员已开通'

    return NextResponse.json({
      success: true,
      idempotent: false,
      message: successMessage,
      grantType: result.grantType ?? 'membership',
      membershipExpiresAt: result.membershipExpiresAt,
      tokenGranted: result.tokenGranted,
      tokenBalance: result.tokenBalance,
    })
  } catch (error) {
    console.error('验证支付错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
