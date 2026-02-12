import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    {
      error: '支付宝官方回调暂未接入',
      code: 'ALIPAY_NOT_IMPLEMENTED',
    },
    { status: 501 }
  )
}
