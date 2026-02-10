/**
 * 教程数据类型定义
 */

export interface Tutorial {
  id: string
  slug: string                 // URL 友好的 slug
  title: string                 // 教程标题
  description: string           // 简介
  content: string               // Markdown 内容
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  readTime: number              // 阅读时长（分钟）
  tags: string[]                // 标签
  category: string              // 分类
  featured: boolean             // 是否推荐
  free: boolean                 // 是否免费
  publishedAt: string           // 发布时间
  updatedAt: string             // 更新时间
}

/**
 * 教程分类类型
 */
export type TutorialDifficulty = 'all' | 'beginner' | 'intermediate' | 'advanced'

/**
 * 目录项类型
 */
export interface TOCItem {
  level: number
  text: string
  id: string
}
