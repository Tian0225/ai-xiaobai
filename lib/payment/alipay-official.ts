export interface AlipayOfficialCreateOrderRequest {
  outTradeNo: string
  amountYuan: number
  subject: string
}

export interface AlipayOfficialCreateOrderResult {
  qrCode?: string
  tradeNo?: string
}

export async function createAlipayOrder(_input: AlipayOfficialCreateOrderRequest) {
  void _input
  throw new Error('支付宝官方支付暂未接入')
}
