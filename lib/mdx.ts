import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

/**
 * MDX 内容管理工具函数
 *
 * 替代原来的 tutorials-data.ts 硬编码方案，
 * 从 content/tutorials/ 目录读取 MDX 文件。
 */

// 教程目录路径
const TUTORIALS_DIR = path.join(process.cwd(), 'content', 'tutorials')

// 教程元数据类型
export interface TutorialMeta {
    slug: string
    title: string
    description: string
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    readTime: number
    tags: string[]
    category: string
    featured: boolean
    free: boolean
    publishedAt: string
    updatedAt?: string
}

// 教程完整数据类型（含内容）
export interface Tutorial extends TutorialMeta {
    content: string
}

/**
 * 获取所有教程元数据（不含内容，用于列表页）
 */
export function getAllTutorials(): TutorialMeta[] {
    const tutorials: TutorialMeta[] = []

    // 遍历 free 和 premium 子目录
    const categories = ['free', 'premium']

    for (const category of categories) {
        const categoryDir = path.join(TUTORIALS_DIR, category)

        // 跳过不存在的目录
        if (!fs.existsSync(categoryDir)) continue

        const files = fs.readdirSync(categoryDir)
            .filter(f => f.endsWith('.mdx'))

        for (const file of files) {
            const slug = file.replace(/\.mdx$/, '')
            const filePath = path.join(categoryDir, file)
            const fileContent = fs.readFileSync(filePath, 'utf8')
            const { data } = matter(fileContent)

            tutorials.push({
                slug,
                title: data.title || slug,
                description: data.description || '',
                difficulty: data.difficulty || 'beginner',
                readTime: data.readTime || 10,
                tags: data.tags || [],
                category: data.category || category,
                featured: data.featured || false,
                free: category === 'free',
                publishedAt: data.publishedAt || new Date().toISOString().split('T')[0],
                updatedAt: data.updatedAt,
            })
        }
    }

    // 按发布日期倒序排列
    tutorials.sort((a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )

    return tutorials
}

/**
 * 根据 slug 获取单篇教程（含内容）
 */
export function getTutorialBySlug(slug: string): Tutorial | null {
    const categories = ['free', 'premium']

    for (const category of categories) {
        const filePath = path.join(TUTORIALS_DIR, category, `${slug}.mdx`)

        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf8')
            const { data, content } = matter(fileContent)

            return {
                slug,
                title: data.title || slug,
                description: data.description || '',
                difficulty: data.difficulty || 'beginner',
                readTime: data.readTime || 10,
                tags: data.tags || [],
                category: data.category || category,
                featured: data.featured || false,
                free: category === 'free',
                publishedAt: data.publishedAt || new Date().toISOString().split('T')[0],
                updatedAt: data.updatedAt,
                content,
            }
        }
    }

    return null
}

/**
 * 根据难度筛选教程
 */
export function getTutorialsByDifficulty(
    difficulty: string
): TutorialMeta[] {
    const all = getAllTutorials()
    if (difficulty === 'all') return all
    return all.filter(t => t.difficulty === difficulty)
}

/**
 * 获取推荐教程
 */
export function getFeaturedTutorials(): TutorialMeta[] {
    return getAllTutorials().filter(t => t.featured)
}

/**
 * 获取所有教程的 slug（用于静态生成）
 */
export function getAllTutorialSlugs(): string[] {
    return getAllTutorials().map(t => t.slug)
}

/**
 * 搜索教程（标题、描述、标签模糊匹配）
 */
export function searchTutorials(query: string): TutorialMeta[] {
    const q = query.toLowerCase()
    return getAllTutorials().filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.toLowerCase().includes(q))
    )
}
