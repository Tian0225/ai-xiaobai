# Supabase 数据库设置指南

## 1. 创建 Supabase 项目

1. 访问 https://supabase.com
2. 点击 "New Project"
3. 填写项目信息并创建

## 2. 获取 API 密钥

在项目设置中找到：
- `NEXT_PUBLIC_SUPABASE_URL`: 你的项目 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: 公开的匿名密钥
- `SUPABASE_SERVICE_ROLE_KEY`: 服务端密钥（保密）

将这些值填入 `.env.local` 文件。

## 3. 创建数据库表

### 3.1 创建 profiles 表

在 Supabase SQL Editor 中执行：

```sql
-- 创建 profiles 表
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  is_member BOOLEAN DEFAULT FALSE,
  membership_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用 RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能查看和更新自己的 profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- 创建触发器：新用户注册时自动创建 profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 3.2 创建 orders 表

```sql
-- 创建 orders 表
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('wechat', 'alipay')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'expired', 'cancelled')),
  transaction_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 创建索引
CREATE INDEX idx_orders_order_id ON orders(order_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);

-- 启用 RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能查看自己的订单
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- 创建策略：用户可以创建订单
CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 创建策略：服务端可以更新订单（通过 service_role）
CREATE POLICY "Service can update orders"
  ON orders FOR UPDATE
  USING (true);
```

## 4. 配置认证

### 4.1 启用邮箱认证

在 Supabase Dashboard → Authentication → Providers：
1. 确保 Email 提供商已启用
2. 配置邮件模板（可选）

### 4.2 配置重定向 URL

在 Supabase Dashboard → Authentication → URL Configuration：

添加以下 URL 到白名单：
- `http://localhost:3000/auth/callback` (开发环境)
- `https://your-domain.com/auth/callback` (生产环境)

## 5. 测试数据库连接

在项目中运行：

```bash
npm run dev
```

访问 `http://localhost:3000/auth` 测试注册和登录功能。

## 6. 生产环境配置

部署到 Vercel 时，在 Vercel 项目设置中添加环境变量：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 7. 支付集成（待完成）

支付轮询 API 需要：
1. 申请微信/支付宝商户账号
2. 获取账单查询 API 权限
3. 配置 API 密钥到环境变量
4. 实现 `lib/payment/polling.ts` 中的实际 API 调用

参考文档：
- 微信支付: https://pay.weixin.qq.com/wiki/doc/api/native.php
- 支付宝: https://opendocs.alipay.com/
