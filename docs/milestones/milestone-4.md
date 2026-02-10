# Milestone 4 - 内容完整迁移 + Git Hook

**完成日期**: 2026-02-11
**项目**: AI-xiaobai
**负责人**: 金田 + Claude

---

## 📋 任务概述

Milestone 4 的目标是实现经验库内容自动同步到网站，通过符号链接和 Git Hook 自动化流程。核心功能包括：
- 符号链接连接经验库
- 自动检测新增 Markdown 文件
- 交互式 MDX 转换
- Git Hook 自动提醒
- 图片优化和路径更新

---

## ✅ 已完成功能

### 1. 符号链接配置

**创建链接**:
```bash
ln -s "/Users/jitian/Documents/金田工作室/经验库" content/source
```

**目录结构**:
```
ai-xiaobai/
├── content/
│   ├── source/          # → 符号链接到经验库
│   └── tutorials/       # 生成的 MDX 教程
│       ├── free/        # 免费教程
│       └── premium/     # 付费教程
```

**优势**:
- ✅ 实时同步经验库内容
- ✅ 不占用额外存储空间
- ✅ 保持单一数据源

### 2. 自动检测脚本

**文件**: [scripts/sync-content.js](scripts/sync-content.js)

**功能**:
- ✅ 扫描经验库所有 .md 文件
- ✅ 自动识别新增文件
- ✅ 交互式询问是否转换
- ✅ 自动生成 frontmatter
- ✅ 保存处理状态（避免重复）

**使用方法**:
```bash
# 方式1：使用 npm 命令（推荐）
npm run sync

# 方式2：直接运行脚本
node scripts/sync-content.js
```

**交互流程**:
```
🔍 检测到 3 个新文件：

1. antigravity-config-guide.md
2. Everything-Claude-Code-配置完全指南.md
3. 30-yuan-opus.md

是否将 "antigravity-config-guide.md" 转换为网站教程？(y/n) y
请输入分类 (free/premium，默认 free): free
请输入简短描述: Antigravity 配置完全指南
请输入标签（逗号分隔，默认 "Claude Code,AI教程"): Antigravity,配置,VSCode

✅ 已生成：content/tutorials/free/antigravity-config-guide.mdx
```

### 3. MDX 快速转换脚本

**文件**: [scripts/convert-to-mdx.js](scripts/convert-to-mdx.js)

**功能**:
- ✅ 单文件快速转换
- ✅ 自动提取标题
- ✅ 生成 frontmatter
- ✅ 支持分类参数

**使用方法**:
```bash
# 转换为免费教程
npm run convert "/path/to/file.md" free

# 转换为付费教程
npm run convert "/path/to/file.md" premium
```

### 4. Git Hook 自动化

**文件**: [scripts/git-hook-post-commit.sh](scripts/git-hook-post-commit.sh)

**功能**:
- ✅ 监听经验库 git commit
- ✅ 检测新增 .md 文件
- ✅ 自动显示转换提示

**安装方法**:
```bash
# 使用 npm 命令一键安装
npm run install-hook

# 或手动安装
cp scripts/git-hook-post-commit.sh \
   "/Users/jitian/Documents/金田工作室/经验库/.git/hooks/post-commit"
chmod +x "/Users/jitian/Documents/金田工作室/经验库/.git/hooks/post-commit"
```

**工作流程**:
```
经验库新增文件
    ↓
git add . && git commit -m "新增教程"
    ↓
自动触发 post-commit Hook
    ↓
显示提示：
  📝 检测到新增的 Markdown 文件：
  新增教程.md

  💡 提示：运行以下命令将新文件转换为网站教程：
     cd /Users/jitian/Documents/ai-xiaobai
     npm run sync
    ↓
用户运行 npm run sync
    ↓
交互式转换为 MDX
    ↓
自动保存到 content/tutorials/
```

### 5. 图片优化脚本

**文件**: [scripts/optimize-images.js](scripts/optimize-images.js)

**功能**:
- ✅ 扫描 MDX 文件中的图片链接
- ✅ 复制本地图片到 public/images/
- ✅ 自动更新图片路径
- ✅ 文件哈希去重

**使用方法**:
```bash
npm run optimize-images
```

**处理示例**:
```markdown
<!-- 转换前 -->
![截图](../../images/screenshot.png)

<!-- 转换后 -->
![截图](/images/screenshot-a1b2c3d4.png)
```

**输出示例**:
```
🔍 扫描 5 个 MDX 文件...

📄 antigravity-config.mdx
   ✅ 复制: screenshot-a1b2c3d4.png
   ✓ 已存在: logo-e5f6g7h8.png
   💾 已更新文件

✅ 完成！共处理 12 张图片
```

### 6. 状态管理

**文件**: `.content-sync-state.json`（自动生成）

**内容**:
```json
{
  "processedFiles": [
    "/Users/jitian/Documents/金田工作室/经验库/antigravity-config-guide.md",
    "/Users/jitian/Documents/金田工作室/经验库/Everything-Claude-Code-配置完全指南.md"
  ]
}
```

**作用**:
- ✅ 记录已处理文件
- ✅ 避免重复询问
- ✅ 支持增量同步

---

## 📚 NPM 脚本命令

### 新增命令

| 命令 | 功能 | 说明 |
|------|------|------|
| `npm run sync` | 自动检测并转换新文件 | 交互式，推荐使用 |
| `npm run convert <file> [category]` | 快速转换单个文件 | 适合手动转换 |
| `npm run optimize-images` | 优化图片路径 | 复制图片到 public/images/ |
| `npm run install-hook` | 安装 Git Hook | 一键安装到经验库 |

---

## 🔄 完整工作流程

### 日常使用流程

```
1. 在经验库写新教程
    ↓
2. git add . && git commit -m "新增教程"
    ↓
3. Hook 自动提示有新文件
    ↓
4. cd /Users/jitian/Documents/ai-xiaobai
    ↓
5. npm run sync
    ↓
6. 交互式选择要转换的文件
    ↓
7. 自动生成 MDX 到 content/tutorials/
    ↓
8. npm run optimize-images（如果有图片）
    ↓
9. 本地预览：npm run dev
    ↓
10. git add . && git commit && git push
```

### 批量迁移流程

```bash
# 1. 运行自动同步脚本
cd /Users/jitian/Documents/ai-xiaobai
npm run sync

# 2. 按提示交互式选择文件

# 3. 优化图片
npm run optimize-images

# 4. 提交代码
git add .
git commit -m "feat: 迁移经验库教程到网站"
git push
```

---

## 📁 目录结构

```
ai-xiaobai/
├── content/
│   ├── source/                    # → 符号链接到经验库
│   └── tutorials/
│       ├── free/                  # 免费教程 MDX
│       │   ├── antigravity-config-guide.mdx
│       │   ├── everything-claude-code.mdx
│       │   └── opus-proxy.mdx
│       └── premium/               # 付费教程 MDX
│
├── public/
│   └── images/                    # 优化后的图片
│       ├── screenshot-a1b2c3d4.png
│       └── logo-e5f6g7h8.png
│
├── scripts/
│   ├── sync-content.js            # 自动检测脚本
│   ├── convert-to-mdx.js          # MDX 转换脚本
│   ├── optimize-images.js         # 图片优化脚本
│   └── git-hook-post-commit.sh    # Git Hook 脚本
│
├── docs/
│   └── git-hook-setup.md          # Git Hook 安装指南
│
└── .content-sync-state.json       # 状态文件（自动生成）
```

---

## 📖 文档

### 新增文档

1. **[docs/git-hook-setup.md](docs/git-hook-setup.md)** - Git Hook 详细安装和使用指南

---

## 🎯 MDX Frontmatter 格式

生成的 MDX 文件包含标准 frontmatter：

```yaml
---
title: "Antigravity 配置完全指南"
description: "详细介绍如何配置 Antigravity 扩展"
date: "2026-02-11"
category: "tutorial"
tags: ["Antigravity", "配置", "VSCode"]
author: "金田"
---
```

**字段说明**:
- `title`: 文章标题（自动从第一行 # 提取）
- `description`: 简短描述（交互时输入）
- `date`: 发布日期（自动生成）
- `category`: 分类（free/premium）
- `tags`: 标签数组（交互时输入，逗号分隔）
- `author`: 作者（默认"金田"）

---

## 🧪 测试流程

### 测试自动检测

```bash
# 1. 在经验库创建测试文件
cd "/Users/jitian/Documents/金田工作室/经验库"
echo "# 测试教程\n\n这是测试内容" > test-tutorial.md
git add test-tutorial.md
git commit -m "test: 测试自动检测"

# 2. 应该看到 Hook 提示信息

# 3. 运行同步脚本
cd /Users/jitian/Documents/ai-xiaobai
npm run sync

# 4. 检查生成的文件
ls -la content/tutorials/free/
cat content/tutorials/free/test-tutorial.mdx
```

### 测试单文件转换

```bash
cd /Users/jitian/Documents/ai-xiaobai
npm run convert "/Users/jitian/Documents/金田工作室/经验库/30-yuan-opus.md" free

# 检查结果
cat content/tutorials/free/30-yuan-opus.mdx
```

### 测试图片优化

```bash
npm run optimize-images

# 检查 public/images/ 目录
ls -la public/images/
```

---

## ⚙️ 配置说明

### 符号链接路径

如果经验库路径不同，需要修改：

**1. 重新创建符号链接**:
```bash
cd /Users/jitian/Documents/ai-xiaobai
rm content/source
ln -s "你的经验库路径" content/source
```

**2. 更新 Git Hook 脚本**:
编辑 `scripts/git-hook-post-commit.sh`，修改第7行：
```bash
EXPERIENCE_REPO="你的经验库路径"
```

**3. 更新 npm 脚本**:
编辑 `package.json`，修改 `install-hook` 命令中的路径。

---

## 🚀 性能优化

### 图片优化建议

1. **使用图片压缩工具**:
   ```bash
   # 安装 sharp（可选）
   npm install sharp

   # 在 optimize-images.js 中集成压缩
   ```

2. **支持 WebP 格式**:
   ```bash
   # 生成 WebP 版本
   # 在浏览器自动选择最优格式
   ```

### 大量文件处理

如果经验库文件很多，可以：

1. **分批处理**:
   ```bash
   # 只处理最近修改的文件
   find content/source -name "*.md" -mtime -7
   ```

2. **并行处理**:
   ```javascript
   // 使用 Promise.all 并行转换
   ```

---

## 📝 最佳实践

### 1. Markdown 文件规范

**推荐格式**:
```markdown
# 文章标题

简短介绍...

## 第一节

内容...

## 第二节

内容...
```

**注意事项**:
- ✅ 第一行必须是 `# 标题`
- ✅ 使用标准 Markdown 语法
- ✅ 图片使用相对路径或绝对路径
- ✅ 避免使用特殊字符

### 2. 文件命名规范

**推荐**:
```
antigravity-config-guide.md          # 使用短横线分隔
everything-claude-code.md            # 全小写
30-yuan-opus.md                      # 数字开头也可以
```

**不推荐**:
```
Antigravity Config Guide.md          # 空格
antigravity_config_guide.md          # 下划线
反向代理配置.md                       # 中文（会转换为拼音）
```

### 3. 图片管理

**建议**:
- 使用 `/images/` 统一存放
- 运行 `npm run optimize-images` 自动处理
- 避免使用外部链接（可能失效）

---

## 🐛 故障排除

### 问题1：符号链接失效

**症状**: `ls -la content/source` 显示红色或断开

**解决**:
```bash
cd /Users/jitian/Documents/ai-xiaobai
rm content/source
ln -s "/Users/jitian/Documents/金田工作室/经验库" content/source
```

### 问题2：Git Hook 不工作

**检查**:
```bash
# 1. 检查 Hook 是否存在
ls -la "/Users/jitian/Documents/金田工作室/经验库/.git/hooks/post-commit"

# 2. 检查执行权限
chmod +x "/Users/jitian/Documents/金田工作室/经验库/.git/hooks/post-commit"

# 3. 测试 Hook
cd "/Users/jitian/Documents/金田工作室/经验库"
touch test.md
git add test.md
git commit -m "test"
```

### 问题3：文件重复询问

**症状**: 每次运行 `npm run sync` 都询问相同文件

**解决**:
```bash
# 检查状态文件
cat .content-sync-state.json

# 如果为空或格式错误，删除重建
rm .content-sync-state.json
npm run sync
```

---

## 📊 技术亮点

### 1. 自动化程度高
- ✅ Git Hook 自动提醒
- ✅ 交互式转换
- ✅ 状态持久化

### 2. 用户体验好
- ✅ 清晰的提示信息
- ✅ 一键安装命令
- ✅ 详细的文档

### 3. 可维护性强
- ✅ 单一数据源（符号链接）
- ✅ 标准化流程
- ✅ 易于扩展

---

## 🎯 Milestone 4 验收标准

✅ **已完成**:
- [x] Git Hook 配置完成
- [x] 符号链接设置（经验库 → content/source）
- [x] 自动检测新文件脚本
- [x] 所有图片优化
- [x] 内部链接更新

**验收标准达成**: 新增经验库文件后，自动询问并转换 ✅

---

## 📝 总结

Milestone 4 成功完成！实现了经验库内容自动同步到网站的完整流程：

**核心成果**:
- ✅ 符号链接连接经验库
- ✅ 自动检测脚本（npm run sync）
- ✅ MDX 快速转换（npm run convert）
- ✅ Git Hook 自动提醒
- ✅ 图片优化脚本（npm run optimize-images）
- ✅ 状态持久化

**工作流程**:
```
经验库新增文件 → git commit → Hook 提醒
→ npm run sync → 交互式转换 → 自动生成 MDX
→ npm run optimize-images → 提交到 GitHub
```

**下一步**: Milestone 5 - 企业服务页面

---

**相关文档**:
- [Git Hook 安装指南](../git-hook-setup.md)
- [PRD 文档](/Users/jitian/Documents/金田工作室/经验库/AI-xiaobai网站开发PRD.md)
