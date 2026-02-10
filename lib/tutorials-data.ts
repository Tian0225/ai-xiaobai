import { Tutorial } from './types'

/**
 * 临时教程数据
 *
 * 说明：这是 Milestone 2 的临时数据，用于快速搭建页面结构
 * Milestone 4 将使用 MDX + Contentlayer 替代
 */

export const tutorials: Tutorial[] = [
  {
    id: '1',
    slug: 'opus-proxy-guide',
    title: '教你反代使用最强模型 Opus 4.6',
    description: '详细教你如何配置反向代理，稳定使用 Claude Opus 4.6 模型，避免封号风险。包含完整的配置步骤、常见问题排查和最佳实践。',
    content: `# 教你反代使用最强模型 Opus 4.6

> **难度**：中级 | **阅读时间**：15 分钟

## 前言

Claude Opus 4.6 是目前最强大的 AI 模型之一，但官方订阅价格昂贵（$249.99/月）。本教程将教你如何通过反向代理的方式，以更低的成本稳定使用 Opus 4.6。

## 什么是反向代理？

反向代理（Reverse Proxy）是一种服务器配置模式，它接收客户端请求后，将请求转发到后端服务器，然后将结果返回给客户端。

**优势**：
- ✅ 成本更低（约 500 元/年）
- ✅ 稳定不封号
- ✅ 速度更快
- ✅ 支持多种模型

## 配置步骤

### 1. 选择反代服务商

推荐的服务商：
- **选项 A**：自建反代（需要技术基础）
- **选项 B**：使用第三方反代服务（简单快捷）

### 2. 配置 API Key

\`\`\`bash
# 在 .env 文件中配置
ANTHROPIC_API_KEY=your-api-key-here
ANTHROPIC_BASE_URL=https://your-proxy-url.com/v1
\`\`\`

### 3. 测试连接

\`\`\`typescript
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: process.env.ANTHROPIC_BASE_URL,
})

const message = await client.messages.create({
  model: 'claude-opus-4-20250514',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Hello, Claude!' }],
})

console.log(message.content)
\`\`\`

## 常见问题

### Q1: 会被封号吗？

**A**: 使用正规的反代服务不会被封号。关键是选择可靠的服务商。

### Q2: 速度会变慢吗？

**A**: 选择国内的反代服务，速度通常比官方直连更快。

### Q3: 成本是多少？

**A**: 约 500 元/年，相比官方的 $249.99/月 便宜很多。

## 最佳实践

1. **定期备份配置**：保存好 API Key 和配置文件
2. **监控使用量**：避免超额使用
3. **选择稳定服务商**：不要频繁更换

## 总结

通过反向代理使用 Opus 4.6 是一个性价比极高的方案。只需简单配置，就能享受最强 AI 模型的能力。

**下一步**：
- [Antigravity 配置指南](/guide/antigravity-config)
- [Everything Claude Code 配置](/guide/everything-claude-code)
`,
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
    description: '完整的 Antigravity 配置教程，从安装到高级配置，让你的 Claude Code 开发效率翻倍。',
    content: `# Antigravity 配置指南

> **难度**：入门 | **阅读时间**：10 分钟

## 什么是 Antigravity？

Antigravity 是一个强大的 Claude Code 增强工具，提供了智能提示、代码补全、项目管理等功能。

## 安装步骤

### 1. 安装 VSCode 扩展

\`\`\`bash
# 在 VSCode 中搜索 "Antigravity"
# 或使用命令行安装
code --install-extension antigravity.antigravity-vscode
\`\`\`

### 2. 配置 API

在 VSCode 设置中配置：

\`\`\`json
{
  "antigravity.apiKey": "your-api-key",
  "antigravity.model": "claude-sonnet-4-5",
  "antigravity.enableAutoCompletion": true
}
\`\`\`

## 核心功能

### 1. 智能代码补全

按 \`Tab\` 键即可使用 AI 补全代码。

### 2. 快速重构

选中代码后，使用 \`Cmd+Shift+P\` 调出命令面板，选择 "Antigravity: Refactor"。

### 3. 代码解释

\`\`\`typescript
// 选中代码后右键 -> "Antigravity: Explain Code"
function complexFunction() {
  // AI 会自动解释这段代码的作用
}
\`\`\`

## 最佳实践

1. **合理使用自动补全**：不要过度依赖，保持思考
2. **定期更新**：Antigravity 经常发布新功能
3. **自定义快捷键**：提高开发效率

## 总结

Antigravity 是 Claude Code 开发者的必备工具，能显著提升开发效率。

**相关教程**：
- [教你反代使用最强模型 Opus 4.6](/guide/opus-proxy-guide)
- [Everything Claude Code 配置](/guide/everything-claude-code)
`,
    difficulty: 'beginner',
    readTime: 10,
    tags: ['Antigravity', '配置', '入门', 'VSCode'],
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
    description: '最强 Claude Code 配置集合，包含所有实用技巧、最佳实践和高级配置。从入门到精通的完整指南。',
    content: `# Everything Claude Code 配置

> **难度**：中级 | **阅读时间**：20 分钟

## 前言

这是一份完整的 Claude Code 配置指南，汇集了所有最佳实践和高级技巧。

## 核心配置

### 1. Slash Commands（斜杠命令）

创建自定义命令来提升效率：

\`\`\`bash
# 在 .claude/commands/ 目录下创建命令
echo "Review this code for security issues" > .claude/commands/security-check.md
\`\`\`

使用：
\`\`\`
/security-check
\`\`\`

### 2. Agent Teams

配置多个专业 Agent 协同工作：

\`\`\`json
{
  "agents": {
    "architect": {
      "role": "系统架构师",
      "tools": ["Read", "Grep", "Glob"]
    },
    "frontend-designer": {
      "role": "前端设计师",
      "tools": ["Read", "Write", "Edit"]
    }
  }
}
\`\`\`

### 3. MCP Servers

集成 Model Context Protocol 服务器：

\`\`\`bash
# 安装 Stitch MCP
npm install @anthropic-ai/mcp-stitch

# 配置
claude mcp add stitch
\`\`\`

## 高级技巧

### 1. 项目级配置

在项目根目录创建 \`.claud\`：

\`\`\`json
{
  "name": "My Project",
  "description": "项目描述",
  "rules": [
    "Always write tests first",
    "Use TypeScript strict mode"
  ]
}
\`\`\`

### 2. 自定义 Prompts

\`\`\`markdown
<!-- .claude/prompts/review.md -->
Review this code with focus on:
1. Performance
2. Security
3. Maintainability
\`\`\`

### 3. Git Hooks 集成

\`\`\`bash
#!/bin/bash
# .git/hooks/pre-commit

# 自动运行代码审查
claude /security-check
\`\`\`

## 常用工作流

### 工作流 1：TDD 开发

\`\`\`bash
1. /plan "实现用户登录功能"
2. /tdd "创建登录组件测试"
3. 实现代码
4. /security-check
5. git commit
\`\`\`

### 工作流 2：代码重构

\`\`\`bash
1. 选中代码
2. /plan "重构这段代码"
3. 审查建议
4. 应用重构
5. 运行测试
\`\`\`

## 性能优化

### 1. 减少 Token 使用

\`\`\`typescript
// 使用 .claudeignore 排除不必要的文件
node_modules/
dist/
.next/
\`\`\`

### 2. 智能上下文选择

只包含相关文件：
\`\`\`bash
# 使用 @文件名 来指定上下文
@src/components/Button.tsx 优化这个组件
\`\`\`

## 团队协作

### 1. 共享配置

\`\`\`bash
# 提交 .claude/ 目录到 Git
git add .claude/
git commit -m "Add Claude Code configuration"
\`\`\`

### 2. 统一代码风格

\`\`\`json
{
  "rules": [
    "Use Prettier for formatting",
    "Follow Airbnb style guide",
    "Write JSDoc comments"
  ]
}
\`\`\`

## 故障排查

### 问题 1：响应速度慢

**解决方案**：
- 减少上下文大小
- 使用 .claudeignore
- 选择更快的模型（如 Sonnet）

### 问题 2：Token 超限

**解决方案**：
- 使用 Strategic Compact
- 分阶段完成任务
- 手动清理上下文

## 总结

掌握这些配置和技巧，你将能充分发挥 Claude Code 的能力，成为 AI 辅助开发的高手。

**推荐阅读**：
- [教你反代使用最强模型 Opus 4.6](/guide/opus-proxy-guide)
- [Antigravity 配置指南](/guide/antigravity-config)

## 资源链接

- [官方文档](https://docs.claude.com)
- [GitHub 仓库](https://github.com/anthropics/claude-code)
- [社区论坛](https://community.anthropic.com)
`,
    difficulty: 'intermediate',
    readTime: 20,
    tags: ['Claude Code', '配置', '最佳实践', '高级'],
    category: 'Claude Code',
    featured: true,
    free: true,
    publishedAt: '2026-02-11',
    updatedAt: '2026-02-11'
  }
]

/**
 * 根据 slug 获取教程
 */
export function getTutorialBySlug(slug: string): Tutorial | undefined {
  return tutorials.find(t => t.slug === slug)
}

/**
 * 根据难度筛选教程
 */
export function getTutorialsByDifficulty(difficulty: string): Tutorial[] {
  if (difficulty === 'all') return tutorials
  return tutorials.filter(t => t.difficulty === difficulty)
}

/**
 * 获取推荐教程
 */
export function getFeaturedTutorials(): Tutorial[] {
  return tutorials.filter(t => t.featured)
}

/**
 * 获取免费教程
 */
export function getFreeTutorials(): Tutorial[] {
  return tutorials.filter(t => t.free)
}
