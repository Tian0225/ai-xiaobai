# Git Hook 安装指南

## 自动检测经验库新增文件

### 安装步骤

1. **复制 Hook 脚本到经验库**:
   ```bash
   cp /Users/jitian/Documents/ai-xiaobai/scripts/git-hook-post-commit.sh \
      /Users/jitian/Documents/金田工作室/经验库/.git/hooks/post-commit
   ```

2. **设置可执行权限**:
   ```bash
   chmod +x "/Users/jitian/Documents/金田工作室/经验库/.git/hooks/post-commit"
   ```

3. **测试 Hook**:
   ```bash
   cd "/Users/jitian/Documents/金田工作室/经验库"

   # 创建测试文件
   echo "# 测试文件" > test.md
   git add test.md
   git commit -m "test: 测试 Git Hook"

   # 应该会看到提示信息
   ```

### 工作流程

```
经验库新增 .md 文件
    ↓
git commit
    ↓
触发 post-commit Hook
    ↓
显示提示信息
    ↓
用户运行: node scripts/sync-content.js
    ↓
交互式转换为 MDX 教程
    ↓
自动生成到 content/tutorials/
```

### 手动安装命令

如果你想现在就安装，运行以下命令：

```bash
# 1. 进入 ai-xiaobai 项目
cd /Users/jitian/Documents/ai-xiaobai

# 2. 安装 Git Hook
cp scripts/git-hook-post-commit.sh \
   "/Users/jitian/Documents/金田工作室/经验库/.git/hooks/post-commit"

# 3. 设置权限
chmod +x "/Users/jitian/Documents/金田工作室/经验库/.git/hooks/post-commit"

# 4. 验证安装
ls -la "/Users/jitian/Documents/金田工作室/经验库/.git/hooks/post-commit"
```

### 使用说明

#### 方法1：使用自动检测脚本（推荐）
```bash
cd /Users/jitian/Documents/ai-xiaobai
node scripts/sync-content.js
```

这会：
- 扫描经验库所有 .md 文件
- 询问是否转换每个新文件
- 自动生成 MDX 到 content/tutorials/
- 记录已处理文件，避免重复询问

#### 方法2：手动转换单个文件
```bash
cd /Users/jitian/Documents/ai-xiaobai
node scripts/convert-to-mdx.js "/path/to/file.md" free
```

参数说明：
- 第1个参数：Markdown 文件路径
- 第2个参数：分类（free 或 premium，默认 free）

### 状态文件

自动检测脚本会在项目根目录生成 `.content-sync-state.json`：
```json
{
  "processedFiles": [
    "/Users/jitian/Documents/金田工作室/经验库/file1.md",
    "/Users/jitian/Documents/金田工作室/经验库/file2.md"
  ]
}
```

这个文件记录了已处理的文件，避免重复询问。

### 卸载 Hook

如果需要卸载 Git Hook：
```bash
rm "/Users/jitian/Documents/金田工作室/经验库/.git/hooks/post-commit"
```
