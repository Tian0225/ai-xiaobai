# AI 变现陪跑报名链路验收

## 前置条件
- 本地或测试环境站点可访问（默认 `http://127.0.0.1:3000`）
- Supabase 已执行表结构：`docs/sql/growth_camp_applications.sql`
- 环境变量已配置：
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

## 执行方式
```bash
E2E_BASE_URL=http://127.0.0.1:3000 \
NEXT_PUBLIC_SUPABASE_URL=... \
SUPABASE_SERVICE_ROLE_KEY=... \
node scripts/deploy/acceptance-growth-camp.mjs
```

## 可选参数
- `E2E_CLEANUP=false`：保留测试数据，默认会自动删除测试数据。

## 验收覆盖
- 提交 `/api/growth-camp/apply`
- 校验 `growth_camp_applications` 新记录入库（初始状态应为 `pending`）
- 自动执行状态流转：`pending -> contacted -> accepted`
- 校验最终状态并输出结果

## 说明
该脚本用于“报名提交 + 线索状态流转”的快速回归。后台页面 `/admin/growth-camp` 的交互展示仍建议人工点击抽查一次。
