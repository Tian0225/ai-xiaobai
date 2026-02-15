# 卡密兑换会员流程（免备案临时方案）

## 流程

1. 用户在外部支付平台购买会员卡密（例如 `https://pay.ldxp.cn/item/5mti07`）。
2. 用户回到本站会员页，输入卡密并提交兑换。
3. 服务端校验卡密状态（未使用/未过期）后自动开通会员。
4. 卡密状态改为 `used`，防止重复兑换。

## 一次性初始化（Supabase）

1. 在 Supabase SQL Editor 执行：

```sql
-- 文件：docs/sql/redeem_codes.sql
```

2. 生成导入 SQL（把本地 txt 卡密导入为 `insert` 语句）：

```bash
npm run redeem:sql -- --input redeem-codes-500.txt --output output/redeem-codes-500.sql --source ldxp-membership-2026-batch1
```

3. 将 `output/redeem-codes-500.sql` 内容贴到 Supabase SQL Editor 执行。

## 环境变量

```env
NEXT_PUBLIC_MEMBERSHIP_PURCHASE_URL=https://pay.ldxp.cn/item/5mti07
```

## 接口

- `POST /api/redeem/consume`
  - 入参：`{ code: string }`
  - 返回：成功时自动开通会员并返回到期时间
