"use client";

import { ExternalLink, ShieldCheck, Sparkles, Truck, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const products = [
  {
    name: "ChatGPT Plus 月卡",
    price: "¥168",
    originalPrice: "$19.99/月",
    features: ["自充模式，账号独享", "支持 GPT-4 级别模型", "自动发货，到账快", "售后问题可追踪处理"],
    link: "https://pay.ldxp.cn/item/p29128",
    ctaLabel: "购买月卡",
    badge: "热门",
  },
  {
    name: "ChatGPT Plus 年卡",
    price: "¥599",
    originalPrice: "$239.88/年",
    features: ["折算每月约 ¥49.9", "比月卡更省", "优先售后支持", "适合长期高频使用"],
    link: "https://pay.ldxp.cn/item/chxl0y",
    ctaLabel: "购买年卡",
    badge: "性价比",
  },
  {
    name: "代理会员",
    price: "¥299",
    originalPrice: "批发价",
    features: ["月卡/年卡阶梯采购", "专属代理后台", "面向团队合作", "适合稳定复购场景"],
    link: "https://pay.ldxp.cn/item/ikdrz4",
    ctaLabel: "购买代理",
    badge: "渠道",
  },
];

const vpnService = {
  name: "机场 VPN 服务",
  price: "¥300",
  duration: "/年",
  features: ["多节点覆盖", "高速稳定连接", "支持多设备", "不限流量", "7x24 技术支持"],
  link: "https://zichong.online/vpn",
};

const assurances = [
  {
    icon: ShieldCheck,
    title: "安全交付",
    description: "采用自充模式，账号权限归你本人管理。",
  },
  {
    icon: Truck,
    title: "快速到账",
    description: "下单后自动处理，大多数场景 1-5 分钟完成。",
  },
  {
    icon: Sparkles,
    title: "售后可追踪",
    description: "异常有工单通道，问题处理链路清晰可查。",
  },
];

const faqs = [
  {
    q: "自充模式和共享账号有什么区别？",
    a: "自充是直接充值到你的个人账号，不是多人共享，稳定性和可控性更高。",
  },
  {
    q: "如果超过 10 分钟还没到账怎么办？",
    a: "请联系售后并提供订单信息，我们会优先排查并人工补偿处理。",
  },
  {
    q: "支持退款吗？",
    a: "虚拟服务通常在完成交付后不支持退款；具体以订单页面说明为准。",
  },
];

export default function ShopPage() {
  return (
      <main className="uipro-shop-canvas min-h-screen pb-16 pt-28 sm:pt-32">
        <section className="layout-grid">
          <div className="uipro-shop-surface rounded-3xl p-8 sm:p-10">
            <p className="uipro-shop-pill inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold">
              Service Marketplace
            </p>
            <h1 className="mt-4 font-display text-4xl leading-tight text-[var(--uipro-shop-text)] sm:text-5xl">
              AI 服务商城
              <br />
              <span className="bg-gradient-to-r from-[var(--uipro-shop-primary)] to-[var(--uipro-shop-cta)] bg-clip-text text-transparent">按可交付标准选购</span>
            </h1>
            <p className="mt-4 max-w-2xl text-base text-[color-mix(in_oklab,var(--uipro-shop-text)_72%,black)] sm:text-lg">
              面向稳定使用场景，提供可追踪、可售后的 AI 服务商品。先看适配，再下单。
            </p>
          </div>
        </section>

        <section className="layout-grid space-section">
          <div className="mb-8">
            <h2 className="font-display text-3xl text-[var(--uipro-shop-text)]">ChatGPT Plus 服务</h2>
            <p className="mt-2 text-[color-mix(in_oklab,var(--uipro-shop-text)_72%,black)]">统一交付标准，按使用周期选择更合适的方案。</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {products.map((product) => (
              <Card key={product.name} className="uipro-shop-bento relative">
                <span className="uipro-shop-pill absolute right-4 top-4 rounded-full px-2.5 py-1 text-xs font-semibold">
                  {product.badge}
                </span>
                <CardHeader>
                  <CardTitle className="text-2xl text-[var(--uipro-shop-text)]">{product.name}</CardTitle>
                  <CardDescription>
                    <div className="mt-1 flex items-end gap-2">
                      <span className="font-display text-4xl text-[var(--uipro-shop-text)]">{product.price}</span>
                      <span className="pb-1 text-xs text-slate-500 line-through">{product.originalPrice}</span>
                    </div>
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <ul className="mb-6 space-y-3">
                    {product.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-slate-700">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--brand-fresh)]" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="uipro-shop-cta w-full rounded-full hover:opacity-95"
                    onClick={() => window.open(product.link, "_blank")}
                  >
                    {product.ctaLabel}
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="layout-grid pb-16">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card className="uipro-shop-bento">
              <CardHeader>
                <CardTitle className="text-2xl text-[var(--uipro-shop-text)]">VPN 机场服务</CardTitle>
                <CardDescription>此服务通过外部专属页面购买，不在本站直接完成支付。</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex items-baseline gap-2">
                  <span className="font-display text-4xl text-[var(--uipro-shop-text)]">{vpnService.price}</span>
                  <span className="text-sm text-slate-500">{vpnService.duration}</span>
                </div>
                <ul className="mb-6 space-y-2">
                  {vpnService.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-[color-mix(in_oklab,var(--uipro-shop-text)_74%,black)]">
                      <Check className="h-4 w-4 text-[var(--uipro-shop-primary)]" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="uipro-shop-cta w-full rounded-full hover:opacity-95"
                  onClick={() => window.open(vpnService.link, "_blank")}
                >
                  前往购买
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="uipro-shop-bento">
              <CardHeader>
                <CardTitle className="text-2xl text-[var(--uipro-shop-text)]">服务保障</CardTitle>
                <CardDescription>确保下单、交付、售后链路清晰可执行。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {assurances.map((item) => {
                  const Icon = item.icon;
                  return (
                    <article key={item.title} className="rounded-xl border border-[color-mix(in_oklab,var(--uipro-shop-secondary)_28%,white)] bg-white p-4">
                      <p className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--uipro-shop-text)]">
                        <Icon className="h-4 w-4 text-[var(--uipro-shop-primary)]" />
                        {item.title}
                      </p>
                      <p className="mt-2 text-sm text-[color-mix(in_oklab,var(--uipro-shop-text)_74%,black)]">{item.description}</p>
                    </article>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="layout-grid pb-12">
          <Card className="uipro-shop-surface rounded-2xl">
            <CardHeader>
              <CardTitle className="text-2xl text-[var(--uipro-shop-text)]">常见问题</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqs.map((item, idx) => (
                <details key={item.q} className={`rounded-xl border bg-white p-4 ${idx % 3 === 0 ? 'md:col-span-2' : ''} border-[color-mix(in_oklab,var(--uipro-shop-secondary)_28%,white)]`}>
                  <summary className="cursor-pointer text-sm font-semibold text-[var(--uipro-shop-text)]">{item.q}</summary>
                  <p className="mt-3 text-sm text-[color-mix(in_oklab,var(--uipro-shop-text)_74%,black)]">{item.a}</p>
                </details>
              ))}
            </CardContent>
          </Card>
        </section>
      </main>
  );
}
