import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { isAdminEmail } from '@/lib/auth/admin'

export async function proxy(request: NextRequest) {
  // 更新 Supabase session
  const { supabaseResponse, user } = await updateSession(request)
  const pathname = request.nextUrl.pathname

  // 需要登录的路径
  const protectedPaths = ['/admin', '/api/orders', '/api/admin']
  const isProtectedPath = protectedPaths.some(path =>
    pathname.startsWith(path)
  )
  const isApiRequest = pathname.startsWith('/api/')

  // 如果是受保护路径且用户未登录，重定向到登录页
  if (isProtectedPath && !user && !isApiRequest) {
    const redirectUrl = new URL('/auth', request.url)
    redirectUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  const isAdminProtectedPath = pathname.startsWith('/admin') || pathname.startsWith('/api/admin')
  if (isAdminProtectedPath) {
    if (!user) {
      if (isApiRequest) {
        return NextResponse.json({ error: '未登录' }, { status: 401, headers: { 'Cache-Control': 'no-store' } })
      }
      const redirectUrl = new URL('/auth', request.url)
      redirectUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    if (!isAdminEmail(user.email)) {
      if (isApiRequest) {
        return NextResponse.json({ error: '无管理员权限' }, { status: 403, headers: { 'Cache-Control': 'no-store' } })
      }
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
