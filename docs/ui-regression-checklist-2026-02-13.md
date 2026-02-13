# UI 回归清单（2026-02-13）

## 范围
- 首页：`/`
- 教程列表：`/guide`
- 教程详情：`/guide/[slug]`
- 会员专区：`/guide/member`
- 会员页：`/membership`
- 商城页：`/shop`
- 企业页：`/enterprise`
- 联系页：`/contact`
- 法务页：`/legal/terms`、`/legal/refund`

## 自动化检查结果
- [x] `npm run lint` 通过
- [x] `npm run build` 通过
- [x] 路由输出包含：`/contact` `/enterprise` `/membership` `/shop` `/legal/terms` `/legal/refund`
- [x] 路由组布局生效：
  - `(marketing)` 统一注入 `Navbar + Footer`
  - `(site)` 统一注入 `Navbar + Footer`
  - `guide` 统一注入 `Navbar`
- [x] 页面级重复注入清理：`(site)` 与 `guide` 页面内不再重复 `<Navbar />` / `<Footer />`

## 人工视觉验收（建议）
- [ ] 桌面端导航高度、阴影、账号菜单与当前页高亮一致
- [ ] 移动端顶部账号入口常驻，展开菜单后动作完整
- [ ] 支付流程三态（加载/成功/异常）文案与颜色符合设计
- [ ] 教程页（列表/详情/会员专区）容器、间距、目录卡样式一致
- [ ] 商城、企业、联系、法务页页脚位置与样式一致

## 备注
- 本次清单中“自动化检查结果”已执行完成。
- “人工视觉验收”需在浏览器设备视口（桌面 + 手机）进行最终确认。
