# P1 后台运营与权限上线检查清单

更新时间：2026-02-12（本地时区）
项目路径：`/Users/jitian/Documents/ai-xiaobai`

## 1) 上线前准备（必须完成）

1. 生产环境变量已配置：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_EMAILS`
- `PAYMENT_VERIFY_TOKEN`

2. `ADMIN_EMAILS` 只包含允许进入后台的管理员邮箱（英文逗号分隔）。

3. Supabase SQL 已执行：
- `/Users/jitian/Documents/ai-xiaobai/docs/sql/admin_operation_logs.sql`

## 2) 代码与构建检查（发布前）

在项目根目录执行：

```bash
npm run lint
npm run build
```

判定标准：
- `lint` 无 error
- `build` 成功并包含路由：
- `/admin`
- `/admin/orders`
- `/api/admin/orders`
- `/api/admin/members`
- `/api/admin/logs`

## 3) 权限验收（双重校验）

### 3.1 非管理员账号

1. 登录非管理员账号。
2. 访问 `/admin/orders`：应被拒绝（重定向到首页或无权限页）。
3. 访问 `/api/admin/orders`：应返回 `403`。

### 3.2 管理员账号

1. 登录管理员账号（邮箱在 `ADMIN_EMAILS`）。
2. 导航中可见“管理后台”入口。
3. 访问 `/admin/orders` 成功。
4. 访问 `/api/admin/orders`、`/api/admin/members`、`/api/admin/logs` 均可返回数据。

## 4) 运营功能验收

### 4.1 订单核销

1. 创建一个 `pending` 订单。
2. 进入后台待确认区。
3. 未勾选“已完成线下到账核对”时，点击确认应被拦截。
4. 勾选后确认支付成功，订单应变为 `paid`，会员应开通。

### 4.2 会员操作

1. 对已支付用户执行“撤销”：
- 必须输入 `REVOKE` 才能执行。
2. 对非会员用户执行“开通”。
3. 对被撤销用户执行“恢复”。
4. 每次操作均可填写备注并成功落库。

## 5) 审计日志验收

在后台“操作日志”确认每条关键操作都有记录：
- 核销成功/失败
- 会员开通/撤销/恢复

每条日志应包含：
- 操作者邮箱
- 动作
- 目标用户或订单
- 结果
- 时间
- 细节（备注或错误信息）

## 6) 风险点与防护（上线门禁）

1. 权限配置风险：
- 风险：`ADMIN_EMAILS` 配错导致越权。
- 门禁：发布前由两人复核 `ADMIN_EMAILS`。

2. 日志缺失风险：
- 风险：未建 `admin_operation_logs` 表导致无法追踪操作。
- 门禁：先执行 SQL，再验收 `/api/admin/logs`。

3. 误操作风险：
- 风险：误核销、误撤销会员。
- 门禁：必须启用“到账核对勾选 + REVOKE 二次确认”。

4. 凭据风险：
- 风险：`PAYMENT_VERIFY_TOKEN` 泄露。
- 门禁：定期轮换，限制暴露范围，仅服务端保存。

## 7) 回滚策略（最小回滚）

1. 先回滚应用版本（Vercel 上一稳定版本）。
2. 保留 `admin_operation_logs` 表（日志不回滚删除）。
3. 复测：
- `/`、`/auth`、`/membership`
- `POST /api/orders/verify`
- `GET /api/admin/orders`
