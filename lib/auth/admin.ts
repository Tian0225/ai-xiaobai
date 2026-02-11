const ADMIN_EMAILS = process.env.ADMIN_EMAILS ?? ''

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function getAdminEmails() {
  return ADMIN_EMAILS
    .split(/[\n,;]/)
    .map(normalizeEmail)
    .filter(Boolean)
}

export function isAdminEmail(email: string | null | undefined) {
  if (!email) return false
  const normalized = normalizeEmail(email)
  return getAdminEmails().includes(normalized)
}
