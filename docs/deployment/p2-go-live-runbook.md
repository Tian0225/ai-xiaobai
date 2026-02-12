# P2 部署与验收 Runbook

更新时间：2026-02-12（本地时区）
项目路径：`/Users/jitian/Documents/ai-xiaobai`

## 1) 环境变量梳理与校验（本地 / Vercel / Supabase）

### 1.1 运行自动校验

```bash
node scripts/deploy/validate-env.mjs
```

校验范围：
- 本地：`.env.local` 与 `.env.example` 比对，检查缺失值和占位值。
- Vercel：`vercel env ls --format json`，检查变量存在性和 `production` 作用域。
- Supabase：用 `SUPABASE_SERVICE_ROLE_KEY` 在线检查核心表（`profiles`、`orders`、`enterprise_consultations`）可访问性。

### 1.2 必填变量清单（生产）

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_EMAILS`
- `NEXT_PUBLIC_MEMBERSHIP_PRICE`
- `PAYMENT_VERIFY_TOKEN`
- `ORDER_RECONCILE_TOKEN`
- `CRON_SECRET`
- `WECHAT_PAY_MCH_ID`
- `WECHAT_PAY_APP_ID`
- `WECHAT_PAY_MCH_SERIAL_NO`
- `WECHAT_PAY_MCH_PRIVATE_KEY`
- `WECHAT_PAY_API_V3_KEY`
- `WECHAT_PAY_NOTIFY_URL`
- `WECHAT_PAY_API_BASE`
- `WECHAT_PAY_ORDER_DESC`
- `WECHAT_BILL_API_URL`
- `WECHAT_BILL_API_TOKEN`
- `ALIPAY_BILL_API_URL`
- `ALIPAY_BILL_API_TOKEN`
- `PAYMENT_POLL_WINDOW_MINUTES`
- `PAYMENT_ADAPTER_TIMEOUT_MS`

### 1.3 当前发现（截至 2026-02-12）

- `vercel env ls --format json` 返回 `envs: []`，说明 Vercel 项目尚未配置生产变量，当前不满足可上线条件。
- 本地 `.env.local` 仅覆盖了 Supabase 与价格，未覆盖支付/对账 token 相关项。
- Supabase CLI 未安装；本项目已提供无需 Supabase CLI 的在线表结构校验。

## 2) 上线前检查清单（Go/No-Go）

### 2.1 数据库（Supabase）

- `profiles`、`orders`、`enterprise_consultations` 三张表存在。
- `orders.status` 包含 `pending/paid/expired/cancelled` 流转。
- `profiles.membership_expires_at` 可被服务端更新。
- `enterprise_consultations` 可写入（服务端）。
- 已执行 `docs/sql/enterprise_consultations.sql`（若未执行）。

### 2.2 回调地址

- Supabase Auth Redirect URLs 包含：
- `http://localhost:3000/auth/callback`
- `${NEXT_PUBLIC_SITE_URL}/auth/callback`
- 微信支付回调地址与实际生产域一致：
- `WECHAT_PAY_NOTIFY_URL=https://<生产域名>/api/payments/wechat/notify`

### 2.3 域名

- 生产主域解析到 Vercel（A/CNAME 生效）。
- `vercel inspect <生产域名>` 可看到 `status: Ready`。
- 页面 Header 含 `strict-transport-security`。

### 2.4 证书

- 生产域证书状态为有效（Vercel 自动证书）。
- 外部回调均使用 HTTPS。

### 2.5 日志与监控

- Vercel Functions Logs 可访问。
- 支付链路关键日志可检索：`订单创建` / `支付回调` / `对账任务` / `人工核销`。
- 部署后 30 分钟观察窗口内无持续 5xx 峰值。

## 3) 验收脚本（启动 / 关键路径 / 异常路径）

### 3.1 自动验收（本地）

```bash
bash scripts/deploy/acceptance.sh
```

自动覆盖：
- 启动：`npm run build` + `npm run start`。
- 关键路径：`/`、`/auth/callback`、`/membership`。
- 异常路径：
- `POST /api/payments/alipay/notify` 应返回 `501 + ALIPAY_NOT_IMPLEMENTED`
- `POST /api/enterprise/consultation` 非法参数应 `400`
- `GET /api/orders/reconcile` 未授权应 `401` 或 `503`

### 3.2 手工验收（支付闭环）

- 登录测试账号，访问 `/membership` 创建订单。
- 微信支付成功后确认：
- `orders.status: pending -> paid`
- `profiles.is_member = true`
- `profiles.membership_expires_at` 按规则延长
- 对同一订单重复触发 `/api/orders/verify`，应返回幂等（不重复发放）。
- 人工对账接口 `/api/orders/reconcile` 带 token 触发后返回统计结果。

## 4) 一键回滚策略与已知问题模板

### 4.1 一键回滚（Vercel）

```bash
bash scripts/deploy/rollback-vercel.sh
```

策略说明：
- 自动读取 Production 且 `READY` 的部署列表。
- 自动选择“上一版”生产部署并执行 `vercel rollback`。
- 回滚后立即执行冒烟：首页、鉴权页、关键 API、日志错误率。

演练模式（不真正执行）：

```bash
DRY_RUN=1 bash scripts/deploy/rollback-vercel.sh
```

### 4.2 已知问题清单模板

- 模板文件：`docs/deployment/known-issues-template.md`
- 用于发布前和发布后统一登记：影响范围、规避方案、回滚条件、责任人、预计修复时间。
