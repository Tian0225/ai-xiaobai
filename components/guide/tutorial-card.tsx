import Link from 'next/link'
import type { TutorialMeta } from '@/lib/mdx'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Crown, Lock, Star } from 'lucide-react'

interface TutorialCardProps {
  tutorial: TutorialMeta
  locked?: boolean
}

const difficultyConfig = {
  beginner: { label: '入门', color: 'bg-green-100 text-green-800 hover:bg-green-200' },
  intermediate: { label: '进阶', color: 'bg-blue-100 text-blue-800 hover:bg-blue-200' },
  advanced: { label: '高级', color: 'bg-purple-100 text-purple-800 hover:bg-purple-200' }
}

export function TutorialCard({ tutorial, locked = false }: TutorialCardProps) {
  const diffConfig = difficultyConfig[tutorial.difficulty]

  const cardContent = (
    <>
      <CardHeader>
        <div className="mb-2 flex items-start justify-between gap-2">
          <Badge className={diffConfig.color}>{diffConfig.label}</Badge>
          <div className="flex items-center gap-1">
            {!tutorial.free && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#eaf4ef] px-2 py-1 text-xs font-medium text-[var(--brand-fresh)]">
                <Crown className="h-3 w-3" />
                会员专享
              </span>
            )}
            {tutorial.featured && (
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
            )}
          </div>
        </div>
        <CardTitle className="line-clamp-2">{tutorial.title}</CardTitle>
        <CardDescription className="line-clamp-3">{tutorial.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {tutorial.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700"
            >
              {tag}
            </span>
          ))}
        </div>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <span>{tutorial.readTime} 分钟</span>
        </div>
      </CardFooter>
    </>
  )

  if (!locked) {
    return (
      <Link href={`/guide/${tutorial.slug}`}>
        <Card className="h-full transition-all hover:-translate-y-1 hover:shadow-lg">
          {cardContent}
        </Card>
      </Link>
    )
  }

  return (
    <div className="relative h-full">
      <Card className="h-full overflow-hidden border-[#d8e6df] bg-white/90">
        <div className="pointer-events-none select-none blur-[1.5px]">{cardContent}</div>
      </Card>
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-[220px] rounded-2xl border border-[#c9ddd5] bg-white/85 p-4 text-center shadow-sm backdrop-blur-md">
          <p className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--brand-fresh)]">
            <Lock className="h-4 w-4" />
            会员专享内容
          </p>
          <p className="mt-2 text-xs text-slate-600">开通后可查看完整教程与后续更新</p>
          <Link
            href="/membership"
            className="mt-3 inline-flex rounded-full bg-[linear-gradient(120deg,#0d3b3a,#3a7d6b)] px-3 py-1.5 text-xs font-semibold text-white"
          >
            去开通会员
          </Link>
        </div>
      </div>
    </div>
  )
}
