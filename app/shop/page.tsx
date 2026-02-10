"use client";

import { ExternalLink, Shield, Zap, Users, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const products = [
  {
    name: "ChatGPT Plus 月卡",
    price: "¥150",
    originalPrice: "$19.99/月",
    features: ["自充模式，安全稳定", "支持 GPT-4 Turbo", "24/7 售后服务", "即买即用"],
    link: "https://zichong.online/chatgpt-plus-monthly",
    badge: "热销",
    icon: "🤖",
  },
  {
    name: "ChatGPT Plus 年卡",
    price: "¥988",
    originalPrice: "$239.88/年",
    features: ["平均每月 ¥82.3", "比月卡节省 45%", "赠送 1 个月", "优先技术支持"],
    link: "https://zichong.online/chatgpt-plus-yearly",
    badge: "最划算",
    icon: "💎",
  },
  {
    name: "代理会员",
    price: "¥299",
    originalPrice: "批发价",
    features: ["月卡 ¥120/10个起", "年卡 ¥800/5个起", "专属代理后台", "丰厚利润空间"],
    link: "https://zichong.online/reseller",
    badge: "赚钱",
    icon: "💰",
  },
];

const vpnService = {
  name: "机场 VPN 服务",
  price: "¥300",
  duration: "/年",
  features: [
    "全球节点覆盖",
    "高速稳定连接",
    "支持多设备同时在线",
    "不限流量",
    "7x24 技术支持",
  ],
  icon: "🚀",
};

const benefits = [
  {
    icon: Shield,
    title: "安全可靠",
    description: "自充模式，不是共享账号，100% 安全",
  },
  {
    icon: Zap,
    title: "即买即用",
    description: "自动发货，1分钟内到账，立即使用",
  },
  {
    icon: Users,
    title: "专业售后",
    description: "7x24 客服支持，遇到问题快速解决",
  },
];

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 via-white to-blue-50 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-6">
              AI 服务商城
              <br />
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                省钱好用的 AI 工具
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8">
              ChatGPT Plus、VPN 等服务，价格实惠，质量保证
            </p>
          </div>
        </div>
      </section>

      {/* ChatGPT Products */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
              ChatGPT Plus 服务
            </h2>
            <p className="text-lg text-gray-600">
              比官方便宜 30%+，自充模式更安全
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {products.map((product, index) => (
              <Card key={index} className="border-2 hover:border-green-300 hover:shadow-xl transition-all relative">
                {product.badge && (
                  <div className="absolute -top-3 -right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    {product.badge}
                  </div>
                )}
                <CardHeader>
                  <div className="text-4xl mb-4">{product.icon}</div>
                  <CardTitle className="text-2xl">{product.name}</CardTitle>
                  <CardDescription className="text-lg">
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-3xl font-bold text-gray-900">{product.price}</span>
                      <span className="text-sm text-gray-500 line-through">{product.originalPrice}</span>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {product.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    onClick={() => window.open(product.link, '_blank')}
                  >
                    立即购买
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* VPN Service */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
              VPN 机场服务
            </h2>
            <p className="text-lg text-gray-600">
              稳定快速的网络加速服务
            </p>
          </div>

          <Card className="max-w-2xl mx-auto border-2 border-blue-200 shadow-xl">
            <CardHeader className="text-center">
              <div className="text-5xl mb-4">{vpnService.icon}</div>
              <CardTitle className="text-3xl">{vpnService.name}</CardTitle>
              <div className="flex items-baseline justify-center gap-2 mt-4">
                <span className="text-4xl font-bold text-gray-900">{vpnService.price}</span>
                <span className="text-gray-500">{vpnService.duration}</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4 mb-8">
                {vpnService.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  ⚠️ 由于政策原因，VPN 服务不在本站直接销售。
                  <br />
                  点击下方按钮跳转到专属购买页面。
                </p>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                size="lg"
                onClick={() => window.open('https://zichong.online/vpn', '_blank')}
              >
                前往购买
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
              为什么选择我们？
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="text-center">
                  <div className="mb-4 inline-flex rounded-full bg-blue-50 p-4 text-blue-600">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
              常见问题
            </h2>
          </div>

          <div className="space-y-6">
            <details className="group border rounded-lg p-6 bg-white hover:border-green-300 transition-colors">
              <summary className="font-semibold text-lg cursor-pointer list-none flex items-center justify-between">
                <span>自充模式是什么？</span>
                <span className="group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-600">
                自充模式是指我们帮您充值到您自己的 OpenAI 账号，不是共享账号。这样更安全，不会被封号，也不会被其他人影响使用体验。
              </p>
            </details>

            <details className="group border rounded-lg p-6 bg-white hover:border-green-300 transition-colors">
              <summary className="font-semibold text-lg cursor-pointer list-none flex items-center justify-between">
                <span>多久能到账？</span>
                <span className="group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-600">
                支付成功后，系统会在 1-5 分钟内自动发货。如超过 10 分钟未到账，请联系客服处理。
              </p>
            </details>

            <details className="group border rounded-lg p-6 bg-white hover:border-green-300 transition-colors">
              <summary className="font-semibold text-lg cursor-pointer list-none flex items-center justify-between">
                <span>支持退款吗？</span>
                <span className="group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-600">
                由于是虚拟商品，一旦充值成功无法退款。建议先购买月卡试用，满意后再购买年卡。
              </p>
            </details>
          </div>
        </div>
      </section>
    </div>
  );
}
