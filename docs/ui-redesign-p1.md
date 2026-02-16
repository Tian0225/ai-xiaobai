# 前台 UI 重设计（P1）

## 1) 设计原则（Stitch 方向）

### 信息层级
- 一级信息：页面目标、关键 CTA、状态反馈（`font-display` + 高对比色）
- 二级信息：价格、权益、说明（常规正文）
- 三级信息：辅助提示、注释、风险提示（低饱和中性色）
- 规则：首屏仅保留一个主动作，避免并列主按钮

### 栅格
- 内容最大宽度统一 `--content-max: 72rem`
- 页面容器使用 `layout-grid`（自动居中 + 响应式留白）
- 列布局优先 `1fr + 固定侧栏` 或 `2/3/4` 等比卡片栅格

### 间距
- 使用语义化间距 token：`--space-2/3/4/6/8/12/16`
- 纵向节奏建议：模块间距 `space-section`，卡片内边距 16-24px
- 同级组件最小垂直间距不低于 12px

### 字体
- 正文字体：`Manrope`（可读性）
- 展示字体：`Space Grotesk`（标题、价格、关键数字）
- 标题使用 `font-display`，正文保持常规字重与对比

### 色彩
- 品牌主色：`--brand-deep` / `--brand-fresh`
- 辅助色：`--brand-sand` / `--brand-signal`
- 所有关键按钮使用一致品牌渐变，非关键按钮使用描边或中性色

### 反馈状态
- 成功：`feedback-success`（绿）
- 警告：`feedback-warning`（黄）
- 异常：`feedback-error`（红）
- 加载：统一使用旋转图标 + 明确动作文案（如“正在检测支付状态”）

## 2) 账号菜单常驻策略（关键页面统一）

- 统一入口：关键页面全部通过 `components/marketing/navbar.tsx` 提供账号入口
- 桌面端：导航右侧常驻账号菜单（头像 + 下拉）
- 移动端：顶部栏常驻账号触达入口（登录按钮或头像），不再依赖先展开汉堡菜单
- 统一能力：会员中心、管理后台（管理员）、退出登录全部保持一致
- 当前覆盖页面：`/`、`/guide`、`/guide/[slug]`、`/guide/member`、`/membership`、`/shop`、`/enterprise`、`/contact`、`/legal/terms`、`/legal/refund`

## 3) 支付页视觉与文案策略

### 加载态
- 创建订单时：展示“正在初始化支付信息”
- 轮询支付时：展示“每 5 秒自动刷新一次”
- 加载状态必须可见且可理解，避免用户误以为卡住

### 成功态
- 明确反馈“支付成功，会员权限已开通”
- 展示自动跳转倒计时，并提供“立即查看会员状态”按钮

### 异常态
- 订单过期：提示“请重新生成新订单并在 10 分钟内完成支付”
- 请求失败：提示“网络波动或接口异常，请稍后重试”
- 底部补充客服兜底文案，降低用户流失

## 4) 桌面端 + 移动端适配说明

- 导航：
  - 桌面端显示完整导航 + 搜索 + 账号下拉
  - 移动端显示品牌 + 账号入口 + 菜单按钮，菜单展开后展示完整导航和账号动作
- 支付区：
  - 桌面端 `QR 面板 + 状态侧栏` 双栏布局
  - 移动端自动堆叠为单列，优先展示二维码和主状态
- 卡片与按钮：
  - 触控目标最小高度 40px
  - 文案在窄屏不折损关键信息（价格、订单号、剩余时间）

## 5) 组件复用清单

- 导航与账户：`/Users/jitian/Documents/ai-xiaobai/components/marketing/navbar.tsx`
- 支付核心：`/Users/jitian/Documents/ai-xiaobai/components/payment/payment-form.tsx`
- 商城页模板：`/Users/jitian/Documents/ai-xiaobai/app/(site)/shop/page.tsx`
- 通用按钮：`/Users/jitian/Documents/ai-xiaobai/components/ui/button.tsx`
- 通用卡片：`/Users/jitian/Documents/ai-xiaobai/components/ui/card.tsx`
- 全局 token/工具类：`/Users/jitian/Documents/ai-xiaobai/app/globals.css`

## 6) 本轮落地范围（P1）

- 导航账号入口常驻与移动端可直达：已完成
- 支付流程三态（加载/成功/异常）与文案统一：已完成
- 商城页视觉重绘（信息层级、卡片系统、CTA 一致性）：已完成
- 教程页列表视觉统一（筛选器、状态条、卡片区间距与容器）：已完成
- 教程详情页视觉统一（标题区、目录卡、正文容器、会员锁定态）：已完成
- 会员专区页视觉统一（概览卡、最近更新区、权限提示与入口按钮）：已完成
- 企业页视觉统一（Hero、能力卡、套餐、案例、表单状态）：已完成
- 联系页视觉统一（高对比信息卡、动作入口、处理说明）：已完成
- 法务页视觉统一（条款/退款页层级、引导动作、可读性）：已完成
- 路由级布局统一（`(marketing)`、`(site)` 与 `guide` 使用布局注入 Navbar/Footer，移除页面重复引入）：已完成

## 7) UI UX Pro Max 接入落地

- 已安装 skill：`/Users/jitian/.codex/skills/ui-ux-pro-max`
- 已生成设计系统主规范：
  - `/Users/jitian/Documents/ai-xiaobai/design-system/MASTER.md`
  - `/Users/jitian/Documents/ai-xiaobai/design-system/pages/*.md`
- 使用方式：
  - 页面优先读取 `design-system/pages/<page>.md`
  - 无页面覆写时读取 `design-system/MASTER.md`

## 8) 发布兜底开关（UI_REVAMP）

- 环境变量：`NEXT_PUBLIC_UI_REVAMP_ENABLED`
  - `true`：使用新 UI（默认）
  - `false`：回退到 legacy 导航/页脚壳
- 布局切换已接入：
  - `app/(marketing)/layout.tsx`
  - `app/(site)/layout.tsx`
  - `app/guide/layout.tsx`
- 快速切换命令：
  - `npm run deploy:ui-on`
  - `npm run deploy:ui-off`
