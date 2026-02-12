export interface MembershipProfile {
  is_member: boolean
  membership_expires_at: string | null
}

export function hasActiveMembership(profile: MembershipProfile | null | undefined): boolean {
  if (!profile?.is_member) return false

  if (!profile.membership_expires_at) {
    return true
  }

  const expiresAt = new Date(profile.membership_expires_at)
  if (Number.isNaN(expiresAt.getTime())) {
    return false
  }

  return expiresAt.getTime() > Date.now()
}
