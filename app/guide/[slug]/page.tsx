import { notFound } from 'next/navigation'
import { getTutorialBySlug, getAllTutorialSlugs } from '@/lib/mdx'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { CodeBlock } from '@/components/guide/code-block'
import { Badge } from '@/components/ui/badge'
import { Clock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { isValidElement, type ReactNode } from 'react'

/**
 * 教程详情页
 *
 * 从 MDX 文件读取内容并渲染。
 */

interface TutorialPageProps {
  params: Promise<{
    slug: string
  }>
}

const difficultyConfig = {
  beginner: { label: '入门', color: 'bg-green-100 text-green-800' },
  intermediate: { label: '进阶', color: 'bg-blue-100 text-blue-800' },
  advanced: { label: '高级', color: 'bg-purple-100 text-purple-800' }
}

interface TocItem {
  id: string
  text: string
  level: 2 | 3
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[`*_~]/g, '')
    .replace(/\s+/g, '-')
}

function flattenText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node)
  }
  if (Array.isArray(node)) {
    return node.map(flattenText).join('')
  }
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return flattenText(node.props.children ?? '')
  }
  return ''
}

function headingId(children: ReactNode) {
  return slugify(flattenText(children))
}

function extractToc(content: string): TocItem[] {
  const lines = content.split('\n')
  const toc: TocItem[] = []
  let inCodeBlock = false

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock
      continue
    }
    if (inCodeBlock) continue

    const h2 = line.match(/^##\s+(.+)$/)
    if (h2) {
      const text = h2[1].trim()
      toc.push({ id: slugify(text), text, level: 2 })
      continue
    }

    const h3 = line.match(/^###\s+(.+)$/)
    if (h3) {
      const text = h3[1].trim()
      toc.push({ id: slugify(text), text, level: 3 })
    }
  }

  return toc
}

const markdownComponents: Components = {
  code({ className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '')
    const language = match ? match[1] : ''
    const code = String(children).replace(/\n$/, '')
    const inline = !className

    if (!inline && language) {
      return <CodeBlock language={language} code={code} />
    }

    return (
      <code className={className} {...props}>
        {children}
      </code>
    )
  },
  h2({ children }) {
    return <h2 id={headingId(children)}>{children}</h2>
  },
  h3({ children }) {
    return <h3 id={headingId(children)}>{children}</h3>
  },
}

export default async function TutorialPage({ params }: TutorialPageProps) {
  const { slug } = await params
  const tutorial = getTutorialBySlug(slug)

  if (!tutorial) {
    notFound()
  }

  const diffConfig = difficultyConfig[tutorial.difficulty]
  const toc = extractToc(tutorial.content)

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* 顶部导航 */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/guide"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            返回教程列表
          </Link>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div>
              {/* 面包屑 */}
              <div className="text-sm text-gray-500 mb-6">
                首页 &gt; 教程 &gt; {tutorial.title}
              </div>

              {/* 文章头部 */}
              <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <Badge className={diffConfig.color}>
                    {diffConfig.label}
                  </Badge>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{tutorial.readTime} 分钟阅读</span>
                  </div>
                </div>

                <h1 className="text-4xl font-bold tracking-tight mb-4">
                  {tutorial.title}
                </h1>

                <p className="text-xl text-gray-600 mb-6">
                  {tutorial.description}
                </p>

                {/* 标签 */}
                <div className="flex flex-wrap gap-2">
                  {tutorial.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* 发布时间 */}
                <div className="text-sm text-gray-500 mt-6">
                  发布于 {new Date(tutorial.publishedAt).toLocaleDateString('zh-CN')}
                  {tutorial.updatedAt && tutorial.updatedAt !== tutorial.publishedAt && (
                    <> · 更新于 {new Date(tutorial.updatedAt).toLocaleDateString('zh-CN')}</>
                  )}
                </div>
              </header>

              {toc.length > 0 && (
                <div className="lg:hidden rounded-xl border bg-white p-5 mb-8">
                  <h2 className="text-sm font-semibold text-gray-900 mb-3">目录</h2>
                  <ul className="space-y-2">
                    {toc.map((item) => (
                      <li key={item.id}>
                        <a
                          href={`#${item.id}`}
                          className={`block text-sm hover:text-gray-900 text-gray-600 ${
                            item.level === 3 ? 'pl-4' : ''
                          }`}
                        >
                          {item.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 文章内容 */}
              <article className="prose prose-lg max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={markdownComponents}
                >
                  {tutorial.content}
                </ReactMarkdown>
              </article>

              {/* 底部导航 */}
              <div className="mt-16 pt-8 border-t">
                <Link
                  href="/guide"
                  className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  返回教程列表
                </Link>
              </div>
            </div>

            {toc.length > 0 && (
              <aside className="hidden lg:block">
                <div className="sticky top-24 rounded-xl border bg-white p-5">
                  <h2 className="text-sm font-semibold text-gray-900 mb-3">目录</h2>
                  <ul className="space-y-2">
                    {toc.map((item) => (
                      <li key={item.id}>
                        <a
                          href={`#${item.id}`}
                          className={`block text-sm hover:text-gray-900 text-gray-600 ${
                            item.level === 3 ? 'pl-4' : ''
                          }`}
                        >
                          {item.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// 生成静态路径（用于静态生成）
export async function generateStaticParams() {
  const slugs = getAllTutorialSlugs()
  return slugs.map((slug) => ({ slug }))
}
