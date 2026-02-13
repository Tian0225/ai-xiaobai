# 订单与会员状态机测试用例（P0）

## Case 1: 正常支付（Happy Path）

前置：用户已登录，会员未开通。

步骤：
1. 在 `/membership` 创建订单。
2. 调用 `/api/orders/verify`（管理员或带 token），传入 `orderId` + `transactionId`。
3. 前台轮询 `/api/orders/check`。

期望：
- `orders.status = paid`，`paid_at`、`transaction_id` 已写入。
- `profiles.is_member = true`，`membership_expires_at` = `paid_at + 1 year`。
- 前台出现“支付成功”，显示 3 秒跳转倒计时并跳转到 `/membership?payment=success`。

## Case 2: 超时过期

前置：存在 `pending` 订单，`expires_at < now`。

备注：
- 官方模式默认有效期 10 分钟。
- 人工核销模式建议配置 `ORDER_EXPIRE_MINUTES_MANUAL=1440`，避免订单过早过期。

步骤：
1. 调用 `/api/orders/check?orderId=...` 或执行 `/api/orders/reconcile`。

期望：
- 订单被置为 `expired`。
- 前台显示“订单已过期，请重新生成订单”。
- 不开通会员，不写入 `paid_at`。

## Case 3: 重复通知（幂等）

前置：同一订单首次通知已成功置 `paid`。

步骤：
1. 再次调用 `/api/orders/verify`（相同或不同 `transactionId`）。
2. 并发触发两次 verify / reconcile（可用两个并发请求模拟）。

期望：
- 返回 `success=true` 且 `idempotent=true`（或一次成功一次幂等成功）。
- 订单仅一次从 `pending -> paid`，不会重复发放会员。
- `membership_expires_at` 不会因为同一订单重复通知被重复叠加。

## Case 4: 异常回滚（会员写入失败）

前置：模拟 `profiles` upsert 失败（例如临时移除权限或注入 DB 错误）。

步骤：
1. 调用 `/api/orders/verify` 处理 `pending` 订单。

期望：
- 接口返回失败，`status=rollback`。
- 系统尝试将本次订单从 `paid` 回滚到 `pending`。
- 若回滚成功：订单保持 `pending`，可重试处理。
- 若回滚失败：返回 `rollbackSucceeded=false`，进入人工介入清单。

## Case 5: 代币订单发放

前置：存在 `TOK100_` 或 `TOK300_` 前缀的 `pending` 订单。

步骤：
1. 调用 `/api/orders/verify` 确认支付。
2. 查询 `profiles.token_balance`。

期望：
- 订单变为 `paid`。
- 代币订单不会修改 `is_member` 与 `membership_expires_at`。
- `profiles.token_balance` 增加对应代币数量（100 或 300）。
- `token_ledger` 新增一条对应流水，`change_amount` 与发放数量一致。

## Case 6: 代币消耗（幂等 requestId）

前置：用户 `token_balance >= 10`。

步骤：
1. 调用 `POST /api/tokens/consume`，传 `amount=10`、`requestId=CONSUME_xxx`。
2. 使用同一个 `requestId` 再次调用一次。

期望：
- 首次调用成功，`token_balance` 扣减 10。
- 第二次调用命中幂等，返回 `idempotent=true`，余额不重复扣减。
- `token_ledger` 仅有一条该 `requestId` 的 `token_consume` 流水。

## 冒烟脚本建议

- 并发幂等：并发两次 `POST /api/orders/verify`，确认仅一条有效支付结果。
- 续期逻辑：将 `profiles.membership_expires_at` 设为未来时间，再支付一次，确认到期时间在原基础上 +1 年。
