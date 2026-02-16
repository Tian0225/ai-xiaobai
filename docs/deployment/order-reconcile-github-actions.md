# 订单对账调度（GitHub Actions）

更新时间：2026-02-16

## 目标

在 Vercel Hobby 计划下，不使用 Vercel Cron，改由 GitHub Actions 定时触发 `/api/orders/reconcile`。

## 1) 已落地内容

- 工作流：`.github/workflows/order-reconcile.yml`
- 调度频率：每 5 分钟（`*/5 * * * *`）
- 触发方式：`POST /api/orders/reconcile` + `x-order-reconcile-token`

## 2) 需要你配置的 Secrets

在 GitHub 仓库 `Settings -> Secrets and variables -> Actions` 中新增：

- `ORDER_RECONCILE_URL`
  - 示例：`https://your-domain.com/api/orders/reconcile`
- `ORDER_RECONCILE_TOKEN`
  - 与 Vercel 环境变量 `ORDER_RECONCILE_TOKEN` 保持一致

## 3) Vercel 环境变量

确认生产环境中存在：

- `ORDER_RECONCILE_TOKEN`

## 4) 手动验证

1. 进入 GitHub Actions 页面
2. 打开 `Order Reconcile Scheduler`
3. 点击 `Run workflow`
4. 查看日志中是否出现 `HTTP status: 200` 且返回 `success: true`

## 5) 回退方案

如需临时停用调度：

- 在 GitHub Actions 页面禁用该 workflow
- 或移除 `schedule`，仅保留 `workflow_dispatch`
