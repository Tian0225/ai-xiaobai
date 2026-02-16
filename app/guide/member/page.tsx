import Link from 'next/link'
import { getAllTutorials } from '@/lib/mdx'
import { createClient } from '@/lib/supabase/server'
import { hasActiveMembership, type MembershipProfile } from '@/lib/membership'
import MemberGuideClient from '@/app/guide/member/member-guide-client'

export const dynamic = 'force-dynamic'

export default async function MemberGuidePage() {
  const premiumTutorials = getAllTutorials().filter((tutorial) => !tutorial.free)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let isMember = false

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_member, membership_expires_at')
      .eq('id', user.id)
      .maybeSingle()

    isMember = hasActiveMembership((profile as MembershipProfile | null) ?? null)
  }

  return (
    <div className="uipro-guide-canvas min-h-screen pt-28 sm:pt-32">
      <section className="layout-grid">
        <div className="uipro-guide-surface rounded-3xl p-8 sm:p-10">
          <p className="text-sm text-slate-500">首页 &gt; 教程 &gt; 会员专区</p>
          <div className="uipro-guide-pill mt-4 inline-flex rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em]">
            Member Zone
          </div>
          <h1 className="mt-4 font-display text-4xl leading-tight text-[var(--uipro-guide-text)] sm:text-5xl">会员专区</h1>
          <p className="mt-4 max-w-3xl text-base text-[color-mix(in_oklab,var(--uipro-guide-text)_72%,black)] sm:text-lg">
            这里聚合进阶实战内容，覆盖工作流、模板和持续更新教程。
          </p>

          {isMember ? (
            <p className="uipro-guide-pill mt-6 inline-flex rounded-full px-4 py-2 text-sm font-medium">
              当前账号已开通会员，可查看全部专享教程
            </p>
          ) : (
            <div className="uipro-guide-surface mt-6 rounded-2xl p-4 sm:p-5">
              <p className="text-sm text-slate-700">你现在看到的是会员教程预览，开通后可查看完整内容。</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href="/membership"
                  className="uipro-guide-cta inline-flex rounded-full px-4 py-2 text-sm font-semibold"
                >
                  去开通会员
                </Link>
                <Link
                  href="/guide"
                  className="uipro-guide-outline inline-flex rounded-full px-4 py-2 text-sm font-semibold"
                >
                  查看免费教程
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <MemberGuideClient tutorials={premiumTutorials} isMember={isMember} />
    </div>
  )
}
