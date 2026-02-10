#!/usr/bin/env node

/**
 * MDX 快速转换脚本
 *
 * 用法：node scripts/convert-to-mdx.js <input.md> [category]
 *
 * 示例：
 *   node scripts/convert-to-mdx.js path/to/file.md free
 */

const fs = require('fs');
const path = require('path');

function toSlug(filename) {
  return filename
    .replace(/\.md$/, '')
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5-]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
}

function convertToMDX(mdContent, metadata) {
  const lines = mdContent.split('\n');
  let title = metadata.title;
  let content = mdContent;

  // 提取第一行作为标题
  if (lines[0].startsWith('# ')) {
    title = lines[0].replace(/^#\s+/, '').trim();
    content = lines.slice(1).join('\n').trim();
  }

  const frontmatter = `---
title: "${title}"
description: "${metadata.description || title}"
date: "${metadata.date || new Date().toISOString().split('T')[0]}"
category: "${metadata.category || 'tutorial'}"
tags: ${JSON.stringify(metadata.tags || ['Claude Code', 'AI教程'])}
author: "金田"
---

`;

  return frontmatter + content;
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('用法: node convert-to-mdx.js <input.md> [category]');
    process.exit(1);
  }

  const inputFile = args[0];
  const category = args[1] || 'free';

  if (!fs.existsSync(inputFile)) {
    console.error(`文件不存在: ${inputFile}`);
    process.exit(1);
  }

  // 读取文件
  const content = fs.readFileSync(inputFile, 'utf8');
  const filename = path.basename(inputFile);

  // 生成元数据
  const metadata = {
    title: filename.replace('.md', ''),
    description: `关于 ${filename.replace('.md', '')} 的教程`,
    category,
    tags: ['Claude Code', 'AI教程'],
    date: new Date().toISOString().split('T')[0]
  };

  // 转换为 MDX
  const mdxContent = convertToMDX(content, metadata);

  // 生成输出路径
  const slug = toSlug(filename);
  const outputDir = path.join(__dirname, '../content/tutorials', category);
  const outputFile = path.join(outputDir, `${slug}.mdx`);

  // 确保目录存在
  fs.mkdirSync(outputDir, { recursive: true });

  // 写入文件
  fs.writeFileSync(outputFile, mdxContent);

  console.log(`✅ 转换成功！`);
  console.log(`   输入: ${inputFile}`);
  console.log(`   输出: ${outputFile}`);
}

main();
