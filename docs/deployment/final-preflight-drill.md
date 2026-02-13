# 发布前最终演练单（P1 + P2）

更新时间：2026-02-12（本地时区）
项目路径：`/Users/jitian/Documents/ai-xiaobai`

## 使用方式

1. 按顺序执行每一步命令。
2. 每步都对照“通过标准”判断是否继续。
3. 任一步失败，先按“失败处理”止损，再进入发布决策。

## Step 1: 本地基础检查

```bash
npm run lint
npm run build
```

通过标准：
- `lint` 无 error。
- `build` 成功结束，且包含关键路由：
- `/admin`
- `/admin/orders`
- `/api/admin/orders`
- `/api/admin/members`
- `/api/admin/logs`
- `/api/orders/verify`

失败处理：
- 停止发布。
- 记录到 `docs/deployment/known-issues-template.md`。
- 修复后从 Step 1 重新执行。

## Step 2: 环境变量完整性检查

```bash
node scripts/deploy/validate-env.mjs
```

通过标准：
- 本地与生产必填变量均齐全（尤其 `ADMIN_EMAILS`、`SUPABASE_SERVICE_ROLE_KEY`、`PAYMENT_VERIFY_TOKEN`）。

失败处理：
- 补齐变量并重新执行 Step 2。
- 如涉及凭据轮换，先完成通知再继续。

## Step 3: 数据库 SQL 状态确认

在 Supabase SQL Editor 执行（如未执行过）：
- `/Users/jitian/Documents/ai-xiaobai/docs/sql/enterprise_consultations.sql`
- `/Users/jitian/Documents/ai-xiaobai/docs/sql/admin_operation_logs.sql`

通过标准：
- 表存在且可查询：`profiles`、`orders`、`enterprise_consultations`、`admin_operation_logs`。

失败处理：
- 不发布，先修复表结构或权限策略。

## Step 4: P1 权限与运营能力演练

手工验证：
1. 非管理员访问 `/admin/orders` 被拒绝。
2. 非管理员访问 `/api/admin/orders` 返回 `403`。
3. 管理员访问后台成功。
4. 订单核销前未勾选到账确认会被拦截。
5. 撤销会员必须输入 `REVOKE`。
6. 会员开通/撤销/恢复可成功执行。
7. `/api/admin/logs` 与后台日志区可看到操作记录。

通过标准：
- 以上 7 项全部通过。

失败处理：
- 不发布。
- 先修复权限边界或运营流程，再从 Step 4 重跑。

## Step 5: P2 支付与回调演练

手工验证：
1. 创建订单后状态为 `pending`。
2. 回调/人工核销后状态变为 `paid`。
3. `profiles.is_member = true`，并写入 `membership_expires_at`。
4. 对同一订单重复核销触发幂等，不重复发放。

通过标准：
- 支付状态机闭环正确，无重复发放。

失败处理：
- 立即标记高风险，不发布。
- 优先核查 `PAYMENT_VERIFY_TOKEN`、回调配置与订单状态机。

## Step 6: 上线后 30 分钟观察

检查项：
1. Vercel Functions Logs 无持续 5xx 峰值。
2. 后台核心接口稳定：
- `/api/admin/orders`
- `/api/admin/members`
- `/api/admin/logs`
- `/api/orders/verify`
3. 抽查 1 条当日后台操作日志，确认字段完整。

通过标准：
- 无持续错误峰值，核心链路可用。

失败处理：
- 立即执行回滚并进入问题登记。

## Step 7: 回滚预案演练（可选 Dry Run）

```bash
DRY_RUN=1 bash scripts/deploy/rollback-vercel.sh
```

通过标准：
- 能正确识别上一稳定版本，回滚命令可执行。

失败处理：
- 发布前先修复回滚脚本或手工回滚流程。

## 发布决策门

仅当 Step 1 至 Step 6 全部通过时允许发布。

任何一步失败：
- 结论必须是 `NO-GO`。
- 同步问题单并指定修复 owner 与预计完成时间。
