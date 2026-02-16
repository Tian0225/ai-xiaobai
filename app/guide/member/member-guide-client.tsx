'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { TutorialMeta } from '@/lib/mdx'
import { TutorialCard } from '@/components/guide/tutorial-card'

type DifficultyFilter = 'all' | 'beginner' | 'intermediate' | 'advanced'
type SortOption = 'latest' | 'oldest' | 'read_time'

const difficultyOptions: Array<{ value: DifficultyFilter; label: string }> = [
  { value: 'all', label: '全部难度' },
  { value: 'beginner', label: '入门' },
  { value: 'intermediate', label: '进阶' },
  { value: 'advanced', label: '高级' },
]

const sortOptions: Array<{ value: SortOption; label: string }> = [
  { value: 'latest', label: '最近更新' },
  { value: 'oldest', label: '最早更新' },
  { value: 'read_time', label: '阅读时长' },
]

const difficultyLabelMap: Record<DifficultyFilter, string> = {
  all: '全部难度',
  beginner: '入门',
  intermediate: '进阶',
  advanced: '高级',
}

const sortLabelMap: Record<SortOption, string> = {
  latest: '最近更新',
  oldest: '最早更新',
  read_time: '阅读时长',
}

interface MemberGuideClientProps {
  tutorials: TutorialMeta[]
  isMember: boolean
}

function toTimeValue(tutorial: TutorialMeta) {
  const timestamp = new Date(tutorial.updatedAt ?? tutorial.publishedAt).getTime()
  return Number.isNaN(timestamp) ? 0 : timestamp
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return '未知时间'
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export default function MemberGuideClient({ tutorials, isMember }: MemberGuideClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const tagOptions = useMemo(() => {
    const tags = new Set<string>()
    for (const tutorial of tutorials) {
      for (const tag of tutorial.tags) {
        const normalized = tag.trim()
        if (normalized) tags.add(normalized)
      }
    }
    return ['all', ...Array.from(tags).sort((a, b) => a.localeCompare(b, 'zh-CN'))]
  }, [tutorials])

  const difficultyFilter: DifficultyFilter = useMemo(() => {
    const value = searchParams.get('difficulty')
    if (value === 'beginner' || value === 'intermediate' || value === 'advanced') {
      return value
    }
    return 'all'
  }, [searchParams])

  const sortOption: SortOption = useMemo(() => {
    const value = searchParams.get('sort')
    if (value === 'oldest' || value === 'read_time') {
      return value
    }
    return 'latest'
  }, [searchParams])

  const selectedTags = useMemo(() => {
    const allowedTags = new Set(tagOptions.filter((tag) => tag !== 'all'))
    return Array.from(
      new Set(
        (searchParams.get('tags') ?? '')
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => allowedTags.has(tag))
      )
    )
  }, [searchParams, tagOptions])

  const updateFilters = ({
    difficulty,
    sort,
    tags,
  }: {
    difficulty?: DifficultyFilter
    sort?: SortOption
    tags?: string[]
  }) => {
    const nextParams = new URLSearchParams(searchParams.toString())
    const nextDifficulty = difficulty ?? difficultyFilter
    const nextSort = sort ?? sortOption
    const nextTags = tags ?? selectedTags

    if (nextDifficulty === 'all') {
      nextParams.delete('difficulty')
    } else {
      nextParams.set('difficulty', nextDifficulty)
    }

    if (nextSort === 'latest') {
      nextParams.delete('sort')
    } else {
      nextParams.set('sort', nextSort)
    }

    if (nextTags.length === 0) {
      nextParams.delete('tags')
    } else {
      nextParams.set('tags', nextTags.join(','))
    }

    const nextQuery = nextParams.toString()
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false })
  }

  const latestUpdates = useMemo(
    () => [...tutorials].sort((a, b) => toTimeValue(b) - toTimeValue(a)).slice(0, 5),
    [tutorials]
  )

  const latestUpdatedAt = latestUpdates[0]?.updatedAt ?? latestUpdates[0]?.publishedAt ?? null

  const visibleTutorials = useMemo(() => {
    const difficultyFiltered =
      difficultyFilter === 'all'
        ? tutorials
        : tutorials.filter((tutorial) => tutorial.difficulty === difficultyFilter)

    const tagFiltered =
      selectedTags.length === 0
        ? difficultyFiltered
        : difficultyFiltered.filter((tutorial) =>
            selectedTags.every((tag) => tutorial.tags.includes(tag))
          )

    const sorted = [...tagFiltered]

    if (sortOption === 'latest') {
      sorted.sort((a, b) => toTimeValue(b) - toTimeValue(a))
    } else if (sortOption === 'oldest') {
      sorted.sort((a, b) => toTimeValue(a) - toTimeValue(b))
    } else {
      sorted.sort((a, b) => a.readTime - b.readTime)
    }

    return sorted
  }, [tutorials, difficultyFilter, selectedTags, sortOption])

  const hasActiveFilters =
    difficultyFilter !== 'all' ||
    sortOption !== 'latest' ||
    selectedTags.length > 0

  return (
    <section className="layout-grid py-10">
      <div className="mb-8 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <section className="surface-card rounded-2xl border border-[#d8e6df] p-5">
          <h2 className="text-lg font-semibold text-slate-900">最近更新</h2>
          {latestUpdates.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">测试阶段暂未发布会员教程。</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {latestUpdates.map((tutorial) => (
                <li key={tutorial.slug} className="flex items-start justify-between gap-3 text-sm">
                  <Link
                    href={`/guide/${tutorial.slug}`}
                    className="font-medium text-slate-800 hover:text-[var(--brand-fresh)]"
                  >
                    {tutorial.title}
                  </Link>
                  <span className="shrink-0 text-slate-500">
                    {formatDate(tutorial.updatedAt ?? tutorial.publishedAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="surface-card rounded-2xl border border-[#d8e6df] p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">专区概览</h2>
          <p className="mt-3 font-display text-4xl text-slate-900">{tutorials.length}</p>
          <p className="text-sm text-slate-600">当前会员专享教程总数</p>
          <p className="mt-4 text-xs text-slate-500">
            最近更新：{latestUpdatedAt ? formatDate(latestUpdatedAt) : '暂无'}
          </p>
          <p className="mt-1 text-xs text-slate-500">当前筛选结果：{visibleTutorials.length}</p>
          <p className="mt-1 text-xs text-slate-500">
            当前标签：{selectedTags.length === 0 ? '全部' : selectedTags.join(' + ')}
          </p>
        </section>
      </div>

      <section className="sticky top-24 z-20 mb-6 rounded-2xl border border-[#d8e6df] bg-white/95 p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/85">
        <h2 className="text-base font-semibold text-slate-900">筛选与排序</h2>

        {hasActiveFilters && (
          <div className="mt-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">已选筛选项</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {difficultyFilter !== 'all' && (
                <button
                  type="button"
                  onClick={() => updateFilters({ difficulty: 'all' })}
                  className="inline-flex items-center gap-1 rounded-full border border-[#b9d1c9] bg-[#eef9f4] px-3 py-1 text-xs font-semibold text-[var(--brand-fresh)]"
                >
                  <span>难度: {difficultyLabelMap[difficultyFilter]}</span>
                  <span aria-hidden>×</span>
                </button>
              )}
              {sortOption !== 'latest' && (
                <button
                  type="button"
                  onClick={() => updateFilters({ sort: 'latest' })}
                  className="inline-flex items-center gap-1 rounded-full border border-[#b9d1c9] bg-[#eef9f4] px-3 py-1 text-xs font-semibold text-[var(--brand-fresh)]"
                >
                  <span>排序: {sortLabelMap[sortOption]}</span>
                  <span aria-hidden>×</span>
                </button>
              )}
              {selectedTags.map((tag) => (
                <button
                  key={`chip-tag-${tag}`}
                  type="button"
                  onClick={() => updateFilters({ tags: selectedTags.filter((item) => item !== tag) })}
                  className="inline-flex items-center gap-1 rounded-full border border-[#b9d1c9] bg-[#eef9f4] px-3 py-1 text-xs font-semibold text-[var(--brand-fresh)]"
                >
                  <span>标签: {tag}</span>
                  <span aria-hidden>×</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">难度</p>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            {difficultyOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => updateFilters({ difficulty: option.value })}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  difficultyFilter === option.value
                    ? 'border-[var(--brand-fresh)] bg-[#eef9f4] text-[var(--brand-fresh)]'
                    : 'border-[#d8e6df] bg-white text-slate-700 hover:border-[#b9d1c9]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">排序</p>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => updateFilters({ sort: option.value })}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  sortOption === option.value
                    ? 'border-[var(--brand-fresh)] bg-[#eef9f4] text-[var(--brand-fresh)]'
                    : 'border-[#d8e6df] bg-white text-slate-700 hover:border-[#b9d1c9]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">标签</p>
          {selectedTags.length > 0 && (
            <button
              type="button"
              onClick={() => updateFilters({ tags: [] })}
              className="mt-2 inline-flex rounded-full border border-[#c8ddd6] bg-white px-3 py-1 text-xs font-semibold text-slate-600 hover:border-[#b9d1c9]"
            >
              清空标签
            </button>
          )}
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            {tagOptions.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  if (tag === 'all') {
                    updateFilters({ tags: [] })
                    return
                  }
                  const nextTags = selectedTags.includes(tag)
                    ? selectedTags.filter((item) => item !== tag)
                    : [...selectedTags, tag]
                  updateFilters({ tags: nextTags })
                }}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  (tag === 'all' && selectedTags.length === 0) || selectedTags.includes(tag)
                    ? 'border-[var(--brand-fresh)] bg-[#eef9f4] text-[var(--brand-fresh)]'
                    : 'border-[#d8e6df] bg-white text-slate-700 hover:border-[#b9d1c9]'
                }`}
              >
                {tag === 'all' ? '全部标签' : tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {tutorials.length === 0 ? (
        <div className="surface-card rounded-2xl border border-dashed border-[#c8ddd6] p-10 text-center text-slate-500">
          测试阶段暂未添加会员教程，稍后会持续更新。
        </div>
      ) : visibleTutorials.length === 0 ? (
        <div className="surface-card rounded-2xl border border-[#d8e6df] p-8 text-center">
          <p className="text-sm text-slate-600">当前筛选条件下没有教程。</p>
          <button
            type="button"
            onClick={() => updateFilters({ difficulty: 'all', sort: 'latest', tags: [] })}
            className="mt-3 inline-flex rounded-full border border-[#c8ddd6] bg-white px-4 py-2 text-sm font-semibold text-slate-700"
          >
            重置筛选
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visibleTutorials.map((tutorial) => (
            <TutorialCard key={tutorial.slug} tutorial={tutorial} locked={!isMember} />
          ))}
        </div>
      )}
    </section>
  )
}
