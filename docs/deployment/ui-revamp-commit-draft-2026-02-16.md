# UI Revamp 提交草案（2026-02-16）

## 目标

只提交本次前台 UI 重构相关改动，避免把无关变更带入。

## 推荐 staging 命令

```bash
git add \
'app/(marketing)/layout.tsx' \
'app/(site)/layout.tsx' \
'app/guide/layout.tsx' \
'app/globals.css' \
'components/marketing/navbar.tsx' \
'components/marketing/legacy-navbar.tsx' \
'components/marketing/legacy-footer.tsx' \
'lib/ui-revamp.ts' \
'proxy.ts' \
'app/(site)/membership/page.tsx' \
'components/payment/payment-form.tsx' \
'app/(site)/payment/confirm/page.tsx' \
'lib/payment/polling.ts' \
'app/(site)/shop/page.tsx' \
'app/guide/guide-client.tsx' \
'app/guide/[slug]/page.tsx' \
'app/guide/member/page.tsx' \
'app/guide/member/member-guide-client.tsx' \
'components/guide/tutorial-card.tsx' \
'app/(site)/enterprise/page.tsx' \
'components/enterprise/hero.tsx' \
'components/enterprise/features.tsx' \
'components/enterprise/pricing-plans.tsx' \
'components/enterprise/case-studies.tsx' \
'components/enterprise/consultation-form.tsx' \
'app/(site)/contact/page.tsx' \
'app/(site)/legal/terms/page.tsx' \
'app/(site)/legal/refund/page.tsx' \
'components/auth/auth-form.tsx' \
'package.json' \
'scripts/deploy/toggle-ui-revamp.sh' \
'scripts/design/run-uipro-practice.sh' \
'design-system/MASTER.md' \
'design-system/README.md' \
'design-system/pages' \
'design-system/practice' \
'docs/ui-redesign-p1.md' \
'docs/ui-regression-checklist-2026-02-13.md' \
'docs/ui-uipro-practice.md' \
'docs/deployment/p2-go-live-runbook.md' \
'docs/deployment/ui-revamp-commit-draft-2026-02-16.md'
```

## 建议排除（本次不提交）

- `vercel.json`（若不是本次 UI 重构目标）
- `app/api/payments/xpay/`（支付后端改造，非本次前台 UI）
- `archive/`
- `output/`
- `redeem-codes-500.txt`
- `output/redeem-codes-500.sql`
- `public/payment/wechat.jpg.bak`
- `supabase/`
- `Claude Code 配置 xpay 更高env 文件.rtf`

## 提交前检查

```bash
git diff --name-only --cached
npm run lint
npm run build
```

## Commit Message 草案

```text
feat(ui): ship stitch-aligned frontend revamp with unified tokens and responsive parity

- unify global design tokens and utility surfaces for guide/enterprise/contact/legal/payment
- apply persistent account-entry navigation strategy across key layouts and pages
- refresh payment UX states (loading/success/expired/error) with clearer recovery copy
- migrate guide, enterprise, contact, and legal pages to shared visual system
- improve a11y/touch targets (nav/menu/account controls, toc links, form autocomplete, aria labels)
- add UI_REVAMP toggle support artifacts and deployment/runbook docs
- add ui-ux-pro-max practice scripts and generated design-system references

Validation:
- npm run lint (pass)
- npm run build (pass)
- responsive audit: 11 pages x 4 viewports = 44 checks (pass)
```
