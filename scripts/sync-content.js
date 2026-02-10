#!/usr/bin/env node

/**
 * 自动检测新文件脚本
 *
 * 功能：
 * 1. 监听经验库中的新增 .md 文件
 * 2. 询问是否转换为网站教程
 * 3. 自动生成 MDX 文件到 content/tutorials/
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const SOURCE_DIR = path.join(__dirname, '../content/source');
const TARGET_DIR = path.join(__dirname, '../content/tutorials');
const STATE_FILE = path.join(__dirname, '../.content-sync-state.json');

// 创建 readline 接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

// 读取状态文件
function loadState() {
  if (fs.existsSync(STATE_FILE)) {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  }
  return { processedFiles: [] };
}

// 保存状态文件
function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// 获取所有 .md 文件
function getMarkdownFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // 跳过隐藏目录
      if (!item.startsWith('.')) {
        files.push(...getMarkdownFiles(fullPath));
      }
    } else if (item.endsWith('.md') && !item.startsWith('.')) {
      files.push(fullPath);
    }
  }

  return files;
}

// 转换为 slug
function toSlug(filename) {
  return filename
    .replace(/\.md$/, '')
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5-]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
}

// 转换 Markdown 为 MDX
function convertToMDX(mdContent, metadata) {
  // 提取第一行作为标题（如果是 # 开头）
  const lines = mdContent.split('\n');
  let title = metadata.title;
  let content = mdContent;

  if (lines[0].startsWith('# ')) {
    title = lines[0].replace(/^#\s+/, '').trim();
    content = lines.slice(1).join('\n').trim();
  }

  // 生成 frontmatter
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

// 处理新文件
async function processNewFiles() {
  const state = loadState();
  const allFiles = getMarkdownFiles(SOURCE_DIR);
  const newFiles = allFiles.filter(f => !state.processedFiles.includes(f));

  if (newFiles.length === 0) {
    console.log('✅ 没有检测到新文件');
    rl.close();
    return;
  }

  console.log(`\n🔍 检测到 ${newFiles.length} 个新文件：\n`);
  newFiles.forEach((file, i) => {
    console.log(`${i + 1}. ${path.basename(file)}`);
  });

  console.log('\n');

  for (const file of newFiles) {
    const filename = path.basename(file);
    const answer = await question(`是否将 "${filename}" 转换为网站教程？(y/n) `);

    if (answer.toLowerCase() === 'y') {
      // 读取文件内容
      const content = fs.readFileSync(file, 'utf8');

      // 生成元数据
      const category = await question('请输入分类 (free/premium，默认 free): ') || 'free';
      const description = await question('请输入简短描述: ');
      const tagsInput = await question('请输入标签（逗号分隔，默认 "Claude Code,AI教程"): ');
      const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()) : ['Claude Code', 'AI教程'];

      const metadata = {
        title: filename.replace('.md', ''),
        description,
        category,
        tags,
        date: new Date().toISOString().split('T')[0]
      };

      // 转换为 MDX
      const mdxContent = convertToMDX(content, metadata);

      // 生成文件名
      const slug = toSlug(filename);
      const targetPath = path.join(TARGET_DIR, category, `${slug}.mdx`);

      // 确保目录存在
      fs.mkdirSync(path.dirname(targetPath), { recursive: true });

      // 写入文件
      fs.writeFileSync(targetPath, mdxContent);

      console.log(`✅ 已生成：${targetPath}\n`);

      // 标记为已处理
      state.processedFiles.push(file);
    } else {
      console.log(`⏭️  跳过：${filename}\n`);
      // 也标记为已处理，避免下次再问
      state.processedFiles.push(file);
    }
  }

  // 保存状态
  saveState(state);
  console.log('✅ 处理完成！');
  rl.close();
}

// 运行
processNewFiles().catch(err => {
  console.error('错误:', err);
  rl.close();
  process.exit(1);
});
