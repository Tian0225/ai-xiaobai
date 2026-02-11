'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

/**
 * 全站搜索对话框
 *
 * 支持 Cmd/Ctrl + K 快捷键触发，对教程标题和描述进行模糊匹配。
 */

interface SearchResult {
    slug: string
    title: string
    description: string
    difficulty: string
    tags: string[]
}

interface SearchDialogProps {
    tutorials: SearchResult[]
}

const difficultyLabels: Record<string, string> = {
    beginner: '入门',
    intermediate: '进阶',
    advanced: '高级',
}

export default function SearchDialog({ tutorials }: SearchDialogProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [query, setQuery] = useState('')
    const router = useRouter()

    // 搜索过滤
    const results = query.trim()
        ? tutorials.filter(t => {
            const q = query.toLowerCase()
            return (
                t.title.toLowerCase().includes(q) ||
                t.description.toLowerCase().includes(q) ||
                t.tags.some(tag => tag.toLowerCase().includes(q))
            )
        })
        : []

    // 快捷键监听
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault()
            setIsOpen(prev => !prev)
        }
        if (e.key === 'Escape') {
            setIsOpen(false)
        }
    }, [])

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [handleKeyDown])

    // 选择结果
    const handleSelect = (slug: string) => {
        setIsOpen(false)
        setQuery('')
        router.push(`/guide/${slug}`)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
            {/* 遮罩 */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setIsOpen(false)}
            />

            {/* 搜索框 */}
            <div className="relative w-full max-w-lg mx-4 bg-white rounded-xl shadow-2xl border overflow-hidden">
                {/* 输入区域 */}
                <div className="flex items-center px-4 border-b">
                    <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <input
                        type="text"
                        placeholder="搜索教程..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="flex-1 px-3 py-4 text-lg outline-none bg-transparent"
                        autoFocus
                    />
                    <button
                        onClick={() => setIsOpen(false)}
                        className="flex-shrink-0 text-xs text-gray-400 border rounded px-2 py-1"
                    >
                        ESC
                    </button>
                </div>

                {/* 搜索结果 */}
                {query.trim() && (
                    <div className="max-h-80 overflow-y-auto">
                        {results.length === 0 ? (
                            <div className="px-4 py-8 text-center text-gray-500">
                                没有找到相关教程
                            </div>
                        ) : (
                            <ul className="py-2">
                                {results.map((result) => (
                                    <li key={result.slug}>
                                        <button
                                            onClick={() => handleSelect(result.slug)}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium text-gray-900">
                                                    {result.title}
                                                </span>
                                                <Badge variant="secondary" className="text-xs">
                                                    {difficultyLabels[result.difficulty] || result.difficulty}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-500 line-clamp-1">
                                                {result.description}
                                            </p>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                {/* 底部提示 */}
                {!query.trim() && (
                    <div className="px-4 py-6 text-center text-sm text-gray-400">
                        输入关键词搜索教程
                    </div>
                )}
            </div>
        </div>
    )
}
