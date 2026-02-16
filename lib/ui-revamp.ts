function normalizeBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback
  const normalized = value.trim().toLowerCase()
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false
  return fallback
}

export function isUiRevampEnabled(): boolean {
  return normalizeBoolean(process.env.NEXT_PUBLIC_UI_REVAMP_ENABLED, true)
}
