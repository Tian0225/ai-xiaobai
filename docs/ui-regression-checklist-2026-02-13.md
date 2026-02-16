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
- [x] 关键页面响应式验收（11 页 × 4 视口 = 44 项）通过  
  - 视口：`375 / 768 / 1024 / 1440`  
  - 校验项：导航存在、账号入口可见、无横向溢出
- [x] 路由输出包含：`/contact` `/enterprise` `/membership` `/shop` `/legal/terms` `/legal/refund`
- [x] 路由组布局生效：
  - `(marketing)` 统一注入 `Navbar + Footer`
  - `(site)` 统一注入 `Navbar + Footer`
  - `guide` 统一注入 `Navbar`
- [x] 页面级重复注入清理：`(site)` 与 `guide` 页面内不再重复 `<Navbar />` / `<Footer />`
- [x] `NEXT_PUBLIC_UI_REVAMP_ENABLED` 开关已接入布局层，可执行快速回退

## 人工视觉验收（建议）
- [ ] 桌面端导航高度、阴影、账号菜单与当前页高亮一致
- [ ] 移动端顶部账号入口常驻，展开菜单后动作完整
- [ ] 支付流程三态（加载/成功/异常）文案与颜色符合设计
- [ ] 教程页（列表/详情/会员专区）容器、间距、目录卡样式一致
- [ ] 商城、企业、联系、法务页页脚位置与样式一致

## 备注
- 本次清单中“自动化检查结果”已在 UI Pro Max 全量迁移后再次执行。
- “人工视觉验收”需在浏览器设备视口（桌面 + 手机）进行最终确认。
