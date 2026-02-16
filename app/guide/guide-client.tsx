'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
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
    <div className="uipro-guide-canvas min-h-screen pb-16 pt-28 sm:pt-32">
      <section className="layout-grid">
        <div className="uipro-guide-surface rounded-3xl p-8 sm:p-10">
          <p className="text-sm text-slate-500">首页 &gt; 教程</p>
          <div className="uipro-guide-pill mt-4 inline-flex rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em]">
            Learning Library
          </div>
          <h1 className="mt-4 font-display text-4xl leading-tight text-[var(--uipro-guide-text)] sm:text-5xl">
            教程中心
          </h1>
          <p className="mt-4 max-w-2xl text-base text-[color-mix(in_oklab,var(--uipro-guide-text)_72%,black)] sm:text-lg">
            免费教程先打基础，会员教程负责深度实战。每周持续更新，可直接用于工作流和项目交付。
          </p>

          <div className="uipro-guide-pill mt-6 inline-flex rounded-full px-4 py-2 text-sm font-medium">
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
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  selectedDifficulty === option.value
                    ? 'uipro-guide-cta'
                    : 'uipro-guide-outline hover:opacity-90'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="layout-grid pb-16 pt-10">
        {filteredTutorials.length === 0 ? (
          <div className="uipro-guide-surface rounded-2xl py-12 text-center">
            <p className="text-slate-600">暂无该难度的教程，先查看全部内容或前往会员专区。</p>
            <div className="mt-4 flex justify-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedDifficulty('all')}
                className="uipro-guide-outline inline-flex rounded-full px-4 py-2 text-sm font-semibold"
              >
                查看全部难度
              </button>
              <Link href="/guide/member" className="uipro-guide-cta inline-flex rounded-full px-4 py-2 text-sm font-semibold">
                打开会员专区
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTutorials.map((tutorial) => (
              <TutorialCard key={tutorial.slug} tutorial={tutorial} locked={!tutorial.free && !isMember} />
            ))}
          </div>
        )}

        <div className="uipro-guide-surface mt-12 rounded-2xl p-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[color-mix(in_oklab,var(--uipro-guide-text)_62%,white)]">
            会员加速区
          </p>
          <p className="mt-2 text-lg font-semibold text-[var(--uipro-guide-text)]">年度会员：持续更新教程 + 模板 + 答疑支持</p>
          <p className="mt-1 text-sm text-[color-mix(in_oklab,var(--uipro-guide-text)_68%,black)]">
            覆盖 Claude / GPT / Gemini 协同工作流，直接对齐业务场景。
          </p>
          <div className="mt-4">
            <Link href="/membership" className="uipro-guide-cta inline-flex rounded-full px-5 py-2 text-sm font-semibold">
              去开通会员
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
