function trimSlash(url: string) {
  return url.replace(/\/+$/, '')
}

function domainFromUrl(url: string) {
  try {
    return new URL(url).host
  } catch {
    return url.replace(/^https?:\/\//, '')
  }
}

const siteUrl = trimSlash(process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'http://localhost:3000')

export const siteProfile = {
  siteName: process.env.NEXT_PUBLIC_SITE_NAME?.trim() || 'AI-xiaobai',
  siteUrl,
  siteDomain: process.env.NEXT_PUBLIC_SITE_DOMAIN?.trim() || domainFromUrl(siteUrl),
  legalEntityName:
    process.env.NEXT_PUBLIC_LEGAL_ENTITY_NAME?.trim() || 'AI-xiaobai（按备案主体信息公示）',
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || 'support@ai-xiaobai.com',
  businessEmail: process.env.NEXT_PUBLIC_BUSINESS_EMAIL?.trim() || 'business@ai-xiaobai.com',
  serviceHours: process.env.NEXT_PUBLIC_SERVICE_HOURS?.trim() || '工作日 10:00-19:00',
  serviceScope:
    process.env.NEXT_PUBLIC_SERVICE_SCOPE?.trim() || '仅提供课程、会员与咨询服务，不提供账号转售',
}
