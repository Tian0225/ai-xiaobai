'use client'

import { useState } from 'react'
import type { TutorialMeta } from '@/lib/mdx'
import { TutorialCard } from '@/components/guide/tutorial-card'

/**
 * 教程列表客户端组件
 *
 * 接收服务端传入的教程元数据，提供客户端难度筛选功能。
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

    const filteredTutorials = selectedDifficulty === 'all'
        ? tutorials
        : tutorials.filter(t => t.difficulty === selectedDifficulty)

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pt-24">
            {/* 顶部区域 */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
                    {/* 面包屑 */}
                    <div className="text-sm text-gray-500 mb-4">
                        首页 &gt; 教程
                    </div>

                    {/* 标题和描述 */}
                    <div className="max-w-3xl">
                        <h1 className="text-4xl font-bold tracking-tight mb-4">
                            🎓 免费教程
                        </h1>
                        <p className="text-xl text-gray-600">
                            从零开始掌握 Claude Code
                        </p>
                    </div>

                    {/* 难度筛选 */}
                    <div className="flex flex-wrap gap-2 mt-8">
                        {difficultyOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setSelectedDifficulty(option.value)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedDifficulty === option.value
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

            {/* 教程网格 */}
            <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
                {filteredTutorials.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">暂无该难度的教程</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTutorials.map((tutorial) => (
                            <TutorialCard key={tutorial.slug} tutorial={tutorial} />
                        ))}
                    </div>
                )}

                {/* 底部提示 */}
                <div className="mt-16 text-center">
                    <p className="text-gray-600">
                        ✓ 500元/年用真 Claude（稳定不封号）
                    </p>
                    <p className="text-gray-600">
                        ✓ 御三家模型（Claude/GPT/Gemini）协同使用
                    </p>
                    <p className="text-gray-600">
                        ✓ 会员每月最新教程 + 专属群
                    </p>
                </div>
            </div>
        </div>
    )
}
