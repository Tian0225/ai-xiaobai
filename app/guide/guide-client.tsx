'use client'

import { useEffect, useState } from 'react'
import type { TutorialMeta } from '@/lib/mdx'
import { TutorialCard } from '@/components/guide/tutorial-card'
import { createClient } from '@/lib/supabase/client'
import { hasActiveMembership, type MembershipProfile } from '@/lib/membership'

/**
 * 教程列表客户端组件
 *
 * 接收服务端传入的教程元数据，提供客户端难度筛选与会员内容蒙版展示。
 */

type Difficulty = 'all' | 'beginner' | 'intermediate' | 'advanced'

const difficultyOptions: { value: Difficulty; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'beginner', label: '入门' },
  { value: 'intermediate', label: '进阶' },
  { value: 'advanced', label: '高级' },
]

interface GuideClientPageProps {
  tutorials: TutorialMeta[]
}

export default function GuideClientPage({ tutorials }: GuideClientPageProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('all')
  const [isMember, setIsMember] = useState(false)
  const [membershipLoading, setMembershipLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    let active = true

    supabase.auth
      .getUser()
      .then(async ({ data }) => {
        if (!active) return

        const user = data.user
        if (!user) {
          setIsMember(false)
          setMembershipLoading(false)
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('is_member, membership_expires_at')
          .eq('id', user.id)
          .maybeSingle()

        if (!active) return
        setIsMember(hasActiveMembership((profile as MembershipProfile | null) ?? null))
        setMembershipLoading(false)
      })
      .catch(() => {
        if (!active) return
        setIsMember(false)
        setMembershipLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const filteredTutorials =
    selectedDifficulty === 'all'
      ? tutorials
      : tutorials.filter((tutorial) => tutorial.difficulty === selectedDifficulty)

  const freeCount = tutorials.filter((tutorial) => tutorial.free).length
  const premiumCount = tutorials.length - freeCount

  return (
    <div className="min-h-screen pt-28 sm:pt-32">
      <section className="layout-grid stitch-section">
        <div className="surface-card stitch-card rounded-3xl p-8 sm:p-10">
          <p className="text-sm text-slate-500">首页 &gt; 教程</p>
          <h1 className="stitch-h1 mt-4">教程中心</h1>
          <p className="mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
            免费教程打底，会员教程做深度扩展，按难度持续更新。
          </p>

          <div className="stitch-feedback mt-6 inline-flex text-sm">
            {membershipLoading
              ? '正在识别会员权限...'
              : isMember
                ? `已解锁全部内容：免费 ${freeCount} 篇 + 会员专享 ${premiumCount} 篇`
                : `当前可学习免费教程 ${freeCount} 篇，另有 ${premiumCount} 篇会员专享（蒙版预览）`}
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {difficultyOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedDifficulty(option.value)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  selectedDifficulty === option.value
                    ? 'border-[var(--brand-fresh)] bg-[var(--brand-fresh)] text-white shadow-[0_8px_20px_-12px_rgba(58,125,107,0.9)]'
                    : 'stitch-control text-slate-700 hover:border-[#9bc6b7] hover:bg-[#f2faf6]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="layout-grid pb-16 pt-2 sm:pt-4">
        {filteredTutorials.length === 0 ? (
          <div className="surface-card stitch-card rounded-2xl py-12 text-center">
            <p className="text-slate-600">当前筛选下暂未发布教程，试试切换难度查看更多内容。</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTutorials.map((tutorial) => (
              <TutorialCard key={tutorial.slug} tutorial={tutorial} locked={!tutorial.free && !isMember} />
            ))}
          </div>
        )}

        <div className="surface-card stitch-card mt-12 rounded-2xl p-6 text-center">
          <p className="text-slate-700">年度会员持续更新教程与模板，覆盖多模型协同实战路径。</p>
          <p className="mt-1 text-slate-700">每月新增内容并提供答疑支持，学习节奏更稳定。</p>
        </div>
      </section>
    </div>
  )
}
