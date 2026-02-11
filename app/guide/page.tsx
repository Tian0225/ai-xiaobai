import { getAllTutorials } from '@/lib/mdx'

// 客户端筛选组件
import GuideClientPage from './guide-client'

export default function GuidePage() {
  // 服务端读取所有教程元数据
  const tutorials = getAllTutorials()

  return <GuideClientPage tutorials={tutorials} />
}
