import Link from 'next/link'
import type { ReactNode } from 'react'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#1f2937_0%,#0b1220_58%,#05070d_100%)] text-slate-100">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between rounded-2xl border border-slate-700/80 bg-black/35 px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-amber-300">Admin Zone</p>
            <p className="text-sm text-slate-300">后台环境与主站已隔离显示</p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-amber-300/50 bg-amber-300/10 px-4 py-2 text-sm text-amber-100 transition hover:bg-amber-300/20"
          >
            返回主站
          </Link>
        </div>
        {children}
      </div>
    </div>
  )
}
