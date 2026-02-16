import Link from 'next/link'
import UserNav from '@/components/auth/user-nav'

export default function LegacyNavbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">AI</span>
            <span className="font-bold text-xl">AI-xiaobai</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/guide" className="text-sm font-medium hover:text-blue-600 transition">
              教程
            </Link>
            <Link href="/membership" className="text-sm font-medium hover:text-blue-600 transition">
              会员
            </Link>
            <Link href="/shop" className="text-sm font-medium hover:text-blue-600 transition">
              商城
            </Link>
            <Link href="/enterprise" className="text-sm font-medium hover:text-blue-600 transition">
              企业服务
            </Link>
          </nav>
        </div>
        <UserNav />
      </div>
    </header>
  )
}
