#!/usr/bin/env node

/**
 * 将经验库 Markdown 文件转换为网站教程
 * 用法: node scripts/convert-to-tutorial.ts <source-file>
 */

import * as fs from 'fs';
import * as path from 'path';

interface TutorialMetadata {
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  readTime: number;
  tags: string[];
  category: string;
  free: boolean;
}

function extractMetadata(content: string): TutorialMetadata {
  // 提取标题
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : '未命名教程';

  // 提取前100字作为描述
  const firstParagraph = content.split('\n\n')[1] || '';
  const description = firstParagraph.replace(/[#*`]/g, '').substring(0, 100) + '...';

  // 估算阅读时间（每分钟250字）
  const wordCount = content.length;
  const readTime = Math.ceil(wordCount / 250);

  return {
    title,
    description,
    difficulty: 'intermediate',
    readTime,
    tags: [],
    category: 'Claude Code',
    free: true,
  };
}

function convertToTutorial(sourceFile: string) {
  console.log(`📝 转换文件: ${sourceFile}`);

  const content = fs.readFileSync(sourceFile, 'utf-8');
  const metadata = extractMetadata(content);
  const slug = path.basename(sourceFile, '.md').toLowerCase().replace(/\s+/g, '-');

  const tutorial = {
    id: Date.now().toString(),
    slug,
    ...metadata,
    content,
    publishedAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0],
  };

  console.log('✅ 转换完成：');
  console.log(`   标题: ${tutorial.title}`);
  console.log(`   Slug: ${tutorial.slug}`);
  console.log(`   阅读时间: ${tutorial.readTime} 分钟`);

  // TODO: 保存到数据库或添加到 tutorials-data.ts
  console.log('\n💡 下一步: 将此教程数据添加到 lib/tutorials-data.ts');

  return tutorial;
}

// 主程序
const sourceFile = process.argv[2];
if (!sourceFile) {
  console.error('❌ 请提供源文件路径');
  console.error('用法: node scripts/convert-to-tutorial.ts <source-file>');
  process.exit(1);
}

convertToTutorial(sourceFile);
