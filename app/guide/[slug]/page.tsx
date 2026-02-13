import { notFound } from 'next/navigation'
import { getTutorialBySlug } from '@/lib/mdx'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { CodeBlock } from '@/components/guide/code-block'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Clock, Crown, Lock } from 'lucide-react'
import Link from 'next/link'
import { isValidElement, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/server'
import { hasActiveMembership, type MembershipProfile } from '@/lib/membership'

export const dynamic = 'force-dynamic'

interface TutorialPageProps {
  params: Promise<{
    slug: string
  }>
}

const difficultyConfig = {
  beginner: { label: '入门', color: 'bg-green-100 text-green-800' },
  intermediate: { label: '进阶', color: 'bg-blue-100 text-blue-800' },
  advanced: { label: '高级', color: 'bg-purple-100 text-purple-800' },
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

function TocCard({ toc }: { toc: TocItem[] }) {
  return (
    <div className="surface-card rounded-2xl border border-[#d8e6df] p-5">
      <h2 className="mb-3 text-sm font-semibold text-slate-900">目录</h2>
      <ul className="space-y-2">
        {toc.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`block text-sm text-slate-600 transition-colors hover:text-[var(--brand-fresh)] ${
                item.level === 3 ? 'pl-4' : ''
              }`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default async function TutorialPage({ params }: TutorialPageProps) {
  const { slug } = await params
  const tutorial = getTutorialBySlug(slug)

  if (!tutorial) {
    notFound()
  }

  let canReadTutorial = tutorial.free

  if (!tutorial.free) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_member, membership_expires_at')
        .eq('id', user.id)
        .maybeSingle()

      canReadTutorial = hasActiveMembership((profile as MembershipProfile | null) ?? null)
    }
  }

  if (!canReadTutorial) {
    return (
      <div className="min-h-screen pt-28 sm:pt-32">
        <section className="layout-grid">
          <div className="mb-5">
            <Link
              href="/guide"
              className="inline-flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-[var(--brand-fresh)]"
            >
              <ArrowLeft className="h-4 w-4" />
              返回教程列表
            </Link>
          </div>

          <div className="surface-card mx-auto max-w-3xl rounded-3xl border border-[#d8e6df] p-6 sm:p-8">
            <p className="inline-flex items-center gap-2 rounded-full bg-[#eaf4ef] px-3 py-1 text-xs font-semibold text-[var(--brand-fresh)]">
              <Crown className="h-4 w-4" />
              会员专享教程
            </p>
            <h1 className="mt-4 font-display text-3xl leading-tight text-[var(--brand-ink)] sm:text-4xl">{tutorial.title}</h1>
            <p className="mt-3 text-slate-600">{tutorial.description}</p>

            <div className="mt-6 rounded-2xl border border-[#d8e6df] bg-[#f7fbf9] p-4">
              <div className="relative overflow-hidden rounded-xl border border-[#dbe6e1] bg-white p-5">
                <div className="space-y-3 blur-[2px]">
                  <div className="h-4 w-2/3 rounded bg-slate-200" />
                  <div className="h-4 w-full rounded bg-slate-200" />
                  <div className="h-4 w-5/6 rounded bg-slate-200" />
                  <div className="h-4 w-4/5 rounded bg-slate-200" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-white/45 backdrop-blur-[2px]">
                  <p className="inline-flex items-center gap-1 rounded-full border border-[#c8ddd6] bg-white/90 px-3 py-1 text-sm font-semibold text-slate-700">
                    <Lock className="h-4 w-4" />
                    开通会员后查看完整内容
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/membership"
                className="inline-flex rounded-full bg-[linear-gradient(120deg,#0d3b3a,#3a7d6b)] px-5 py-2 text-sm font-semibold text-white"
              >
                去开通会员
              </Link>
              <Link
                href="/guide"
                className="inline-flex rounded-full border border-[#c8ddd6] bg-white px-5 py-2 text-sm font-semibold text-slate-700"
              >
                先看免费教程
              </Link>
            </div>
          </div>
        </section>
      </div>
    )
  }

  const diffConfig = difficultyConfig[tutorial.difficulty]
  const toc = extractToc(tutorial.content)

  return (
    <div className="min-h-screen pt-28 sm:pt-32">
        <section className="layout-grid">
          <div className="mb-5">
            <Link
              href="/guide"
              className="inline-flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-[var(--brand-fresh)]"
            >
              <ArrowLeft className="h-4 w-4" />
              返回教程列表
            </Link>
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div>
              <div className="mb-5 text-sm text-slate-500">首页 &gt; 教程 &gt; {tutorial.title}</div>

              <header className="surface-card mb-8 rounded-3xl border border-[#d8e6df] p-6 sm:p-8">
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <Badge className={diffConfig.color}>{diffConfig.label}</Badge>
                  <span className="inline-flex items-center gap-1 text-sm text-slate-600">
                    <Clock className="h-4 w-4" />
                    {tutorial.readTime} 分钟阅读
                  </span>
                  {!tutorial.free && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#eaf4ef] px-3 py-1 text-xs font-semibold text-[var(--brand-fresh)]">
                      <Crown className="h-3.5 w-3.5" />
                      会员专享
                    </span>
                  )}
                </div>

                <h1 className="font-display text-3xl leading-tight text-[var(--brand-ink)] sm:text-4xl">{tutorial.title}</h1>
                <p className="mt-4 text-base text-slate-600 sm:text-lg">{tutorial.description}</p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {tutorial.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-[#eef5f1] px-3 py-1 text-sm text-slate-700">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-5 text-sm text-slate-500">
                  发布于 {new Date(tutorial.publishedAt).toLocaleDateString('zh-CN')}
                  {tutorial.updatedAt && tutorial.updatedAt !== tutorial.publishedAt && (
                    <> · 更新于 {new Date(tutorial.updatedAt).toLocaleDateString('zh-CN')}</>
                  )}
                </div>
              </header>

              {toc.length > 0 && <div className="mb-6 lg:hidden"><TocCard toc={toc} /></div>}

              <article className="surface-card prose prose-lg max-w-none rounded-3xl border border-[#d8e6df] p-6 sm:p-8">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                  {tutorial.content}
                </ReactMarkdown>
              </article>

              <div className="mt-10 pb-14">
                <Link
                  href="/guide"
                  className="inline-flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-[var(--brand-fresh)]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  返回教程列表
                </Link>
              </div>
            </div>

            {toc.length > 0 && (
              <aside className="hidden lg:block">
                <div className="sticky top-24">
                  <TocCard toc={toc} />
                </div>
              </aside>
            )}
          </div>
        </section>
    </div>
  )
}
