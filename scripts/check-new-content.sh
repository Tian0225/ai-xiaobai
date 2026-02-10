#!/bin/bash

# 检测经验库中的新文件
# 用法: ./scripts/check-new-content.sh

CONTENT_SOURCE="/Users/jitian/Documents/金田工作室/经验库"
LOG_FILE=".content-sync-log"

echo "🔍 检查经验库新增内容..."

# 获取所有 .md 文件
new_files=$(find "$CONTENT_SOURCE" -name "*.md" -type f -newer "$LOG_FILE" 2>/dev/null)

if [ -z "$new_files" ]; then
  echo "✅ 没有发现新文件"
  exit 0
fi

echo "📄 发现新文件："
echo "$new_files"
echo ""
echo "是否需要将这些文件转换为网站教程？(y/n)"

# 更新日志文件
touch "$LOG_FILE"
