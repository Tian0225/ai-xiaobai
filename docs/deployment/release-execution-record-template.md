# 发布执行记录模板（值班留档）

更新时间：2026-02-12（本地时区）
项目路径：`/Users/jitian/Documents/ai-xiaobai`

> 发布批次：`<release-id>`
> 版本：`<git-sha / tag>`
> 发布窗口：`YYYY-MM-DD HH:mm ~ HH:mm`
> 值班人：`@oncall`
> 复核人：`@reviewer`

## A. 发布前确认（Preflight）

- [ ] 已执行：`npm run lint`
- [ ] 已执行：`npm run build`
- [ ] 已执行：`node scripts/deploy/validate-env.mjs`
- [ ] 已确认 SQL：`docs/sql/admin_operation_logs.sql` 已在生产执行
- [ ] 已确认 `ADMIN_EMAILS` 双人复核完成
- [ ] 已确认 `PAYMENT_VERIFY_TOKEN` 为有效且未泄露

备注：
- 

## B. P1 权限与运营验收记录

### B1. 权限边界

- [ ] 非管理员访问 `/admin/orders` 被拒绝
- [ ] 非管理员访问 `/api/admin/orders` 返回 `403`
- [ ] 管理员可进入后台并看到运营面板

### B2. 运营动作

- [ ] 核销前未勾选到账确认会被拦截
- [ ] 核销成功后订单 `pending -> paid`
- [ ] 会员“开通/撤销/恢复”动作均可执行
- [ ] 撤销动作必须输入 `REVOKE`

### B3. 审计日志

- [ ] 后台日志区可见最新操作
- [ ] `/api/admin/logs` 可返回操作日志
- [ ] 日志字段完整（操作者/动作/结果/时间/细节）

验收结论：`通过 / 不通过`
负责人签字：`__________`

## C. P2 支付与状态机验收记录

- [ ] 创建订单后状态为 `pending`
- [ ] 回调或人工核销后状态为 `paid`
- [ ] 会员到期时间正确更新
- [ ] 重复核销命中幂等（无重复发放）

验收结论：`通过 / 不通过`
负责人签字：`__________`

## D. 发布与回滚准备

- [ ] 已确认回滚脚本可用：`DRY_RUN=1 bash scripts/deploy/rollback-vercel.sh`
- [ ] 已明确回滚触发阈值（例如 5xx 持续 5 分钟超过阈值）
- [ ] 已准备已知问题记录：`docs/deployment/known-issues-template.md`

回滚阈值说明：
- 

## E. 发布后观察（T+30min）

- [ ] Vercel Functions Logs 无持续 5xx 峰值
- [ ] 核心接口可用：
- `/api/admin/orders`
- `/api/admin/members`
- `/api/admin/logs`
- `/api/orders/verify`
- [ ] 抽查当日 1 条后台操作日志字段完整

观察结论：`稳定 / 不稳定`
值班人签字：`__________`

## F. 最终发布决策

- 发布结果：`GO / NO-GO`
- 决策时间：`YYYY-MM-DD HH:mm`
- 决策人：`__________`
- 决策说明：
- 

## G. 事件与问题追踪（如有）

- 问题编号：
- 严重级别：`P0 / P1 / P2 / P3`
- 临时缓解：
- 永久修复负责人：
- 预计完成时间（ETA）：
