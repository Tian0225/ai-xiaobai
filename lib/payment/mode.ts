export type PaymentMode = 'manual' | 'official'

function normalizeMode(raw: string | undefined): PaymentMode {
  const value = (raw ?? '').trim().toLowerCase()
  return value === 'official' ? 'official' : 'manual'
}

export function getServerPaymentMode(): PaymentMode {
  return normalizeMode(process.env.PAYMENT_MODE)
}

export function getClientPaymentMode(): PaymentMode {
  // Client components can only read NEXT_PUBLIC_ vars.
  return normalizeMode(process.env.NEXT_PUBLIC_PAYMENT_MODE ?? process.env.PAYMENT_MODE)
}

export function isOfficialPaymentMode(mode: PaymentMode) {
  return mode === 'official'
}
