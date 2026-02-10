import { notFound } from 'next/navigation'
import { getTutorialBySlug } from '@/lib/tutorials-data'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { CodeBlock } from '@/components/guide/code-block'
import { Badge } from '@/components/ui/badge'
import { Clock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface TutorialPageProps {
  params: {
    slug: string
  }
}

const difficultyConfig = {
  beginner: { label: '入门', color: 'bg-green-100 text-green-800' },
  intermediate: { label: '进阶', color: 'bg-blue-100 text-blue-800' },
  advanced: { label: '高级', color: 'bg-purple-100 text-purple-800' }
}

export default function TutorialPage({ params }: TutorialPageProps) {
  const tutorial = getTutorialBySlug(params.slug)

  if (!tutorial) {
    notFound()
  }

  const diffConfig = difficultyConfig[tutorial.difficulty]

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
        <div className="max-w-4xl mx-auto">
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
              {tutorial.updatedAt !== tutorial.publishedAt && (
                <> · 更新于 {new Date(tutorial.updatedAt).toLocaleDateString('zh-CN')}</>
              )}
            </div>
          </header>

          {/* 文章内容 */}
          <article className="prose prose-lg max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // 自定义代码块渲染
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '')
                  const language = match ? match[1] : ''
                  const code = String(children).replace(/\n$/, '')

                  if (!inline && language) {
                    return <CodeBlock language={language} code={code} />
                  }

                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  )
                },
                // 自定义标题渲染（添加锚点）
                h2({ children }) {
                  const text = String(children)
                  const id = text.toLowerCase().replace(/\s+/g, '-')
                  return <h2 id={id}>{children}</h2>
                },
                h3({ children }) {
                  const text = String(children)
                  const id = text.toLowerCase().replace(/\s+/g, '-')
                  return <h3 id={id}>{children}</h3>
                },
              }}
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
      </div>
    </div>
  )
}

// 生成静态路径（用于静态生成）
export async function generateStaticParams() {
  const { tutorials } = await import('@/lib/tutorials-data')
  return tutorials.map((tutorial) => ({
    slug: tutorial.slug,
  }))
}
