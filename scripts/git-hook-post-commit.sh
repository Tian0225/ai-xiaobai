#!/bin/bash

# Git Hook: post-commit
# 功能：检测经验库新增文件，自动提示转换为网站教程

# 经验库路径
EXPERIENCE_REPO="/Users/jitian/Documents/金田工作室/经验库"

# 检查是否在经验库中
if [[ "$PWD" == "$EXPERIENCE_REPO"* ]] || [[ "$PWD" == "$EXPERIENCE_REPO" ]]; then
  echo ""
  echo "🔍 检测到经验库提交..."
  echo ""

  # 获取新增的 .md 文件
  NEW_FILES=$(git diff-tree --no-commit-id --name-only --diff-filter=A -r HEAD | grep '\.md$')

  if [ -n "$NEW_FILES" ]; then
    echo "📝 检测到新增的 Markdown 文件："
    echo "$NEW_FILES"
    echo ""
    echo "💡 提示：运行以下命令将新文件转换为网站教程："
    echo "   cd /Users/jitian/Documents/ai-xiaobai"
    echo "   node scripts/sync-content.js"
    echo ""
  fi
fi
