# Design System 使用说明

## 文件结构

- 主规范：`/Users/jitian/Documents/ai-xiaobai/design-system/MASTER.md`
- 页面覆写：`/Users/jitian/Documents/ai-xiaobai/design-system/pages/*.md`

## 规则优先级

1. 构建某个页面时，先读 `design-system/pages/<page>.md`
2. 若页面文件存在，以页面规则为准
3. 若页面文件不存在，使用 `design-system/MASTER.md`

## 重新生成（UI UX Pro Max）

```bash
python3 /Users/jitian/.codex/skills/ui-ux-pro-max/scripts/search.py \
  "AI education SaaS membership ecommerce content platform" \
  --design-system --persist --project-name "AI-xiaobai" --format markdown \
  --output-dir /Users/jitian/Documents/ai-xiaobai
```

页面覆写示例：

```bash
python3 /Users/jitian/.codex/skills/ui-ux-pro-max/scripts/search.py \
  "AI education SaaS membership ecommerce content platform" \
  --design-system --persist --project-name "AI-xiaobai" --format markdown \
  --output-dir /Users/jitian/Documents/ai-xiaobai --page membership
```
