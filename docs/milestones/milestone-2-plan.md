# Milestone 2 规划文档：免费教程区开发

> **创建时间**：2026-02-11
> **负责人**：纪钿 + Claude (Sonnet 4.5)
> **负责 Agent**：Agent 3 (Content Engineer) + Agent 2 (Frontend Designer)
> **状态**：🚀 开发中

---

## 📋 Milestone 2 目标

根据 PRD 文档，Milestone 2 的核心目标是：**建立免费教程区，让用户可以正常阅读教程内容**

### 交付物清单

- [ ] 教程页面路由和布局（`app/guide/`）
- [ ] 教程列表页面组件
- [ ] 教程详情页面布局
- [ ] 3个核心免费教程（暂时使用 Markdown）
  - [ ] 教你反代使用最强模型 Opus 4.6
  - [ ] Antigravity配置指南
  - [ ] Everything Claude Code 配置
- [ ] 代码高亮功能
- [ ] 代码复制按钮
- [ ] 响应式设计（移动端适配）

### 验收标准
✅ **可以正常阅读所有免费教程**

**说明**：本阶段暂不集成 MDX 和 Contentlayer，先使用静态数据和基础 Markdown 渲染，确保页面结构和交互完整。

---

## 🏗️ 技术实现方案

### 1. 路由结构

```
app/
├── guide/
│   ├── page.tsx              # 教程列表页面
│   ├── layout.tsx            # 教程区布局
│   └── [slug]/
│       └── page.tsx          # 教程详情页面（动态路由）
```

### 2. 核心组件

#### 组件列表
```
components/
├── guide/
│   ├── tutorial-card.tsx     # 教程卡片组件
│   ├── tutorial-list.tsx     # 教程列表组件
│   ├── tutorial-sidebar.tsx  # 侧边栏导航
│   ├── code-block.tsx        # 代码块组件（带高亮和复制）
│   └── breadcrumb.tsx        # 面包屑导航
```

#### 组件功能

**TutorialCard（教程卡片）**：
- 教程标题
- 简介摘要
- 难度标签（入门/进阶/高级）
- 阅读时长
- 点击跳转

**TutorialList（教程列表）**：
- 分类筛选（全部/入门/进阶）
- 搜索功能（可选，本阶段可暂不实现）
- 教程卡片网格布局
- 响应式设计

**TutorialSidebar（侧边栏）**：
- 文章目录（Table of Contents）
- 锚点跳转
- 当前阅读位置高亮
- 固定在右侧（桌面端）

**CodeBlock（代码块）**：
- 语法高亮（使用 `react-syntax-highlighter` 或 `shiki`）
- 一键复制按钮
- 语言标识
- 行号显示

**Breadcrumb（面包屑）**：
- 首页 > 教程 > 当前教程
- 点击返回上级

---

### 3. 数据结构

#### 教程数据类型（TypeScript）

```typescript
// lib/types.ts

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
```

#### 临时数据（Phase 1）

```typescript
// lib/tutorials-data.ts

export const tutorials: Tutorial[] = [
  {
    id: '1',
    slug: 'opus-proxy-guide',
    title: '教你反代使用最强模型 Opus 4.6',
    description: '详细教你如何配置反向代理，稳定使用 Claude Opus 4.6 模型，避免封号风险',
    content: '# 教程内容占位符\n\n本教程将教你...',
    difficulty: 'intermediate',
    readTime: 15,
    tags: ['Claude', 'Opus', '反代', '配置'],
    category: 'Claude Code',
    featured: true,
    free: true,
    publishedAt: '2026-02-11',
    updatedAt: '2026-02-11'
  },
  {
    id: '2',
    slug: 'antigravity-config',
    title: 'Antigravity 配置指南',
    description: '完整的 Antigravity 配置教程，从安装到高级配置',
    content: '# 教程内容占位符\n\n本教程将教你...',
    difficulty: 'beginner',
    readTime: 10,
    tags: ['Antigravity', '配置', '入门'],
    category: 'Claude Code',
    featured: true,
    free: true,
    publishedAt: '2026-02-11',
    updatedAt: '2026-02-11'
  },
  {
    id: '3',
    slug: 'everything-claude-code',
    title: 'Everything Claude Code 配置',
    description: '最强 Claude Code 配置集合，包含所有实用技巧',
    content: '# 教程内容占位符\n\n本教程将教你...',
    difficulty: 'intermediate',
    readTime: 20,
    tags: ['Claude Code', '配置', '最佳实践'],
    category: 'Claude Code',
    featured: true,
    free: true,
    publishedAt: '2026-02-11',
    updatedAt: '2026-02-11'
  }
]
```

---

### 4. 代码高亮方案

**选择：react-syntax-highlighter**（轻量、易用）

**安装依赖**：
```bash
npm install react-syntax-highlighter
npm install --save-dev @types/react-syntax-highlighter
```

**使用示例**：
```typescript
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

<SyntaxHighlighter language="typescript" style={oneDark}>
  {code}
</SyntaxHighlighter>
```

---

### 5. Markdown 渲染方案

**选择：react-markdown**（支持 GitHub Flavored Markdown）

**安装依赖**：
```bash
npm install react-markdown
npm install remark-gfm        # GitHub Flavored Markdown
npm install rehype-raw        # 支持 HTML
```

**使用示例**：
```typescript
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

<ReactMarkdown remarkPlugins={[remarkGfm]}>
  {content}
</ReactMarkdown>
```

---

## 🎨 设计规范

### 教程列表页面布局

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          面包屑: 首页 > 教程
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  🎓 免费教程
  从零开始掌握 Claude Code

  [全部]  [入门]  [进阶]  [高级]  # 分类筛选

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ 教程卡片 1   │ │ 教程卡片 2   │ │ 教程卡片 3   │
│             │ │             │ │             │
│ 标题         │ │ 标题         │ │ 标题         │
│ 简介...      │ │ 简介...      │ │ 简介...      │
│             │ │             │ │             │
│ [入门] 10分钟│ │ [进阶] 15分钟│ │ [进阶] 20分钟│
└─────────────┘ └─────────────┘ └─────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 教程详情页面布局（桌面端）

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  面包屑: 首页 > 教程 > 当前教程
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌────────────────────┬──────────────┐
│                    │  目录（TOC）  │
│  # 教程标题         │  - 第一节     │
│                    │  - 第二节     │
│  [入门] 10分钟      │  - 第三节     │
│                    │              │
│  ## 第一节          │  （固定右侧） │
│  内容...            │              │
│                    │              │
│  ```code```        │              │
│  [复制]            │              │
│                    │              │
│  ## 第二节          │              │
│  内容...            │              │
│                    │              │
└────────────────────┴──────────────┘
```

### 移动端布局

```
━━━━━━━━━━━━━━━━━━━━━
  首页 > 教程 > 当前教程
━━━━━━━━━━━━━━━━━━━━━

  # 教程标题

  [入门] 10分钟

  [展开目录 ▼]

  ## 第一节
  内容...

  ```code```
  [复制]

  ## 第二节
  内容...

━━━━━━━━━━━━━━━━━━━━━
```

---

## 🚀 开发步骤

### Step 1: 安装依赖包
```bash
npm install react-markdown remark-gfm rehype-raw
npm install react-syntax-highlighter
npm install --save-dev @types/react-syntax-highlighter
```

### Step 2: 创建数据类型和临时数据
- [ ] `lib/types.ts` - 定义 Tutorial 接口
- [ ] `lib/tutorials-data.ts` - 创建 3 个教程的临时数据

### Step 3: 创建教程列表页面
- [ ] `app/guide/page.tsx` - 教程列表页面
- [ ] `app/guide/layout.tsx` - 教程区布局
- [ ] `components/guide/tutorial-card.tsx` - 教程卡片
- [ ] `components/guide/tutorial-list.tsx` - 教程列表

### Step 4: 创建教程详情页面
- [ ] `app/guide/[slug]/page.tsx` - 动态路由详情页
- [ ] `components/guide/tutorial-sidebar.tsx` - 侧边栏目录
- [ ] `components/guide/code-block.tsx` - 代码块组件
- [ ] `components/guide/breadcrumb.tsx` - 面包屑

### Step 5: 更新导航栏
- [ ] 在 `components/marketing/navbar.tsx` 中添加「教程」链接

### Step 6: 测试和优化
- [ ] 测试所有教程页面可访问
- [ ] 测试代码高亮和复制功能
- [ ] 测试响应式设计
- [ ] 优化加载性能

---

## 📊 验收检查清单

### 功能验收
- [ ] 可以访问教程列表页面（`/guide`）
- [ ] 可以看到 3 个免费教程卡片
- [ ] 点击卡片可以跳转到详情页
- [ ] 详情页可以正常渲染 Markdown 内容
- [ ] 代码块有语法高亮
- [ ] 代码块有复制按钮且可用
- [ ] 面包屑导航正常工作
- [ ] 侧边栏目录可以跳转

### 设计验收
- [ ] 符合极简科技风设计
- [ ] 桌面端布局正常
- [ ] 移动端布局正常
- [ ] 字体、间距、颜色符合设计规范

### 性能验收
- [ ] 页面加载速度 < 1s
- [ ] 代码高亮不阻塞渲染
- [ ] 无 console 错误或警告

---

## 🔧 技术细节

### 代码复制功能实现

```typescript
'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

export function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button onClick={handleCopy} className="...">
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
    </button>
  )
}
```

### 目录自动生成（TOC）

```typescript
export function generateTOC(markdown: string) {
  const headings = markdown.match(/^#{1,3}\s+.+$/gm) || []
  return headings.map(heading => {
    const level = heading.match(/^#+/)?.[0].length || 1
    const text = heading.replace(/^#+\s+/, '')
    const id = text.toLowerCase().replace(/\s+/g, '-')
    return { level, text, id }
  })
}
```

---

## 📝 后续优化（Milestone 3+）

以下功能暂不在 Milestone 2 实现：

- ❌ 全站搜索功能
- ❌ MDX + Contentlayer 集成
- ❌ 从经验库自动同步
- ❌ 教程评论系统
- ❌ 学习进度追踪
- ❌ 教程收藏功能

---

## 🎯 成功标准

**Milestone 2 成功标准**：

1. ✅ 用户访问 `/guide` 可以看到教程列表
2. ✅ 用户点击教程可以阅读完整内容
3. ✅ 代码示例有高亮和复制功能
4. ✅ 移动端和桌面端都可正常使用
5. ✅ 页面符合设计规范

**完成后自动执行**：
- 保存 Milestone 2 完成文档
- 提交代码到 Git
- 推送到 GitHub
- 更新 README

---

**文档创建时间**：2026-02-11
**创建者**：Claude (Sonnet 4.5)
**状态**：🚀 准备开始开发
