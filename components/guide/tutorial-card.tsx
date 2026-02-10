import Link from 'next/link'
import { Tutorial } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Star } from 'lucide-react'

interface TutorialCardProps {
  tutorial: Tutorial
}

const difficultyConfig = {
  beginner: { label: '入门', color: 'bg-green-100 text-green-800 hover:bg-green-200' },
  intermediate: { label: '进阶', color: 'bg-blue-100 text-blue-800 hover:bg-blue-200' },
  advanced: { label: '高级', color: 'bg-purple-100 text-purple-800 hover:bg-purple-200' }
}

export function TutorialCard({ tutorial }: TutorialCardProps) {
  const diffConfig = difficultyConfig[tutorial.difficulty]

  return (
    <Link href={`/guide/${tutorial.slug}`}>
      <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1">
        <CardHeader>
          <div className="flex items-start justify-between gap-2 mb-2">
            <Badge className={diffConfig.color}>
              {diffConfig.label}
            </Badge>
            {tutorial.featured && (
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            )}
          </div>
          <CardTitle className="line-clamp-2">{tutorial.title}</CardTitle>
          <CardDescription className="line-clamp-3">
            {tutorial.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {tutorial.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700"
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
      </Card>
    </Link>
  )
}
