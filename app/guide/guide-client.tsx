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
  { value: 'advanced', label: '高级' }
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

    supabase.auth.getUser().then(async ({ data }) => {
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
    }).catch(() => {
      if (!active) return
      setIsMember(false)
      setMembershipLoading(false)
    })

    return () => {
      active = false
    }
  }, [])

  const filteredTutorials = selectedDifficulty === 'all'
    ? tutorials
    : tutorials.filter((tutorial) => tutorial.difficulty === selectedDifficulty)

  const freeCount = tutorials.filter((tutorial) => tutorial.free).length
  const premiumCount = tutorials.length - freeCount

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pt-24">
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-4 text-sm text-gray-500">首页 &gt; 教程</div>

          <div className="max-w-3xl">
            <h1 className="mb-4 text-4xl font-bold tracking-tight">🎓 教程中心</h1>
            <p className="text-xl text-gray-600">免费教程 + 会员专享，按你的学习阶段持续更新</p>
          </div>

          <div className="mt-6 inline-flex rounded-full border border-[#c8ddd6] bg-[#f5fbf8] px-4 py-2 text-sm text-slate-700">
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
                className={`rounded-lg px-4 py-2 font-medium transition-colors ${selectedDifficulty === option.value
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {filteredTutorials.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-500">暂无该难度的教程</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTutorials.map((tutorial) => (
              <TutorialCard
                key={tutorial.slug}
                tutorial={tutorial}
                locked={!tutorial.free && !isMember}
              />
            ))}
          </div>
        )}

        <div className="mt-16 text-center">
          <p className="text-gray-600">✓ 年度会员：持续更新的教程与模板</p>
          <p className="text-gray-600">✓ 多模型协同：Claude/GPT/Gemini 实战路径</p>
          <p className="text-gray-600">✓ 会员权益：每月更新 + 答疑支持</p>
        </div>
      </div>
    </div>
  )
}
