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
- 当前覆盖页面：`/`、`/guide`、`/guide/[slug]`、`/membership`、`/shop`、`/enterprise`

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
- 通用按钮：`/Users/jitian/Documents/ai-xiaobai/components/ui/button.tsx`
- 通用卡片：`/Users/jitian/Documents/ai-xiaobai/components/ui/card.tsx`
- 全局 token/工具类：`/Users/jitian/Documents/ai-xiaobai/app/globals.css`
