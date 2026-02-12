import Link from 'next/link'
import Navbar from '@/components/marketing/navbar'
import { TutorialCard } from '@/components/guide/tutorial-card'
import { getAllTutorials } from '@/lib/mdx'
import { createClient } from '@/lib/supabase/server'
import { hasActiveMembership, type MembershipProfile } from '@/lib/membership'

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
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pt-24">
        <div className="border-b bg-white">
          <div className="container mx-auto px-4 py-14 sm:px-6 lg:px-8">
            <div className="mb-3 text-sm text-gray-500">首页 &gt; 教程 &gt; 会员专区</div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">👑 会员专区</h1>
            <p className="mt-3 max-w-3xl text-lg text-slate-600">
              这里是会员专享内容，覆盖进阶工作流、模板和持续更新教程。
            </p>

            {isMember ? (
              <p className="mt-6 inline-flex rounded-full border border-[#c8ddd6] bg-[#eef9f4] px-4 py-2 text-sm font-medium text-[#1f7a56]">
                当前账号已开通会员，可查看全部专享教程
              </p>
            ) : (
              <div className="mt-6 rounded-2xl border border-[#d8e6df] bg-white/90 p-4 sm:p-5">
                <p className="text-sm text-slate-700">你现在看到的是会员教程预览，开通后可查看完整内容。</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href="/membership"
                    className="inline-flex rounded-full bg-[linear-gradient(120deg,#0d3b3a,#3a7d6b)] px-4 py-2 text-sm font-semibold text-white"
                  >
                    去开通会员
                  </Link>
                  <Link
                    href="/guide"
                    className="inline-flex rounded-full border border-[#c8ddd6] bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                  >
                    查看免费教程
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          {premiumTutorials.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#c8ddd6] bg-white p-10 text-center text-slate-500">
              测试阶段暂未添加会员教程，稍后会持续更新。
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {premiumTutorials.map((tutorial) => (
                <TutorialCard
                  key={tutorial.slug}
                  tutorial={tutorial}
                  locked={!isMember}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
