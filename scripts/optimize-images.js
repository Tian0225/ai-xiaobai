#!/usr/bin/env node

/**
 * 图片优化脚本
 *
 * 功能：
 * 1. 扫描 MDX 文件中的图片链接
 * 2. 复制外部图片到 public/images/
 * 3. 更新 MDX 文件中的图片路径
 * 4. 优化图片大小（可选）
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CONTENT_DIR = path.join(__dirname, '../content/tutorials');
const IMAGES_DIR = path.join(__dirname, '../public/images');

// 确保图片目录存在
fs.mkdirSync(IMAGES_DIR, { recursive: true });

// 生成文件哈希（用于去重）
function getFileHash(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(content).digest('hex').substring(0, 8);
}

// 扫描 MDX 文件
function scanMDXFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...scanMDXFiles(fullPath));
    } else if (item.endsWith('.mdx')) {
      files.push(fullPath);
    }
  }

  return files;
}

// 提取图片链接
function extractImageLinks(content) {
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const matches = [];
  let match;

  while ((match = imageRegex.exec(content)) !== null) {
    matches.push({
      alt: match[1],
      src: match[2],
      fullMatch: match[0]
    });
  }

  return matches;
}

// 处理图片
function processImages() {
  const mdxFiles = scanMDXFiles(CONTENT_DIR);
  let totalProcessed = 0;

  console.log(`\n🔍 扫描 ${mdxFiles.length} 个 MDX 文件...\n`);

  for (const file of mdxFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const images = extractImageLinks(content);

    if (images.length === 0) continue;

    let newContent = content;
    let fileChanged = false;

    console.log(`📄 ${path.basename(file)}`);

    for (const image of images) {
      // 跳过已经是相对路径的图片
      if (image.src.startsWith('/images/') || image.src.startsWith('./')) {
        console.log(`   ✓ ${image.src} (已优化)`);
        continue;
      }

      // 跳过外部 URL（http/https）
      if (image.src.startsWith('http://') || image.src.startsWith('https://')) {
        console.log(`   ⚠️  ${image.src} (外部链接，需手动处理)`);
        continue;
      }

      // 处理本地文件路径
      const imagePath = path.resolve(path.dirname(file), image.src);

      if (!fs.existsSync(imagePath)) {
        console.log(`   ❌ ${image.src} (文件不存在)`);
        continue;
      }

      // 复制图片到 public/images/
      const ext = path.extname(imagePath);
      const hash = getFileHash(imagePath);
      const baseName = path.basename(imagePath, ext);
      const newFileName = `${baseName}-${hash}${ext}`;
      const newPath = path.join(IMAGES_DIR, newFileName);

      if (!fs.existsSync(newPath)) {
        fs.copyFileSync(imagePath, newPath);
        console.log(`   ✅ 复制: ${newFileName}`);
      } else {
        console.log(`   ✓ 已存在: ${newFileName}`);
      }

      // 更新 MDX 中的路径
      const newSrc = `/images/${newFileName}`;
      const newMatch = `![${image.alt}](${newSrc})`;
      newContent = newContent.replace(image.fullMatch, newMatch);
      fileChanged = true;
      totalProcessed++;
    }

    // 如果文件有变化，写回
    if (fileChanged) {
      fs.writeFileSync(file, newContent);
      console.log(`   💾 已更新文件\n`);
    } else {
      console.log('');
    }
  }

  console.log(`✅ 完成！共处理 ${totalProcessed} 张图片\n`);
}

// 运行
processImages();
