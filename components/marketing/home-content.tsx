import Link from "next/link";
import { getAllTutorials } from "@/lib/mdx";
import { TutorialCard } from "@/components/guide/tutorial-card";
import { ArrowRight, Crown, Sparkles, Users, Building2, ShieldCheck, Zap, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * 首页内容板块
 *
 * 在 Hero Section 下方展示：教程预览、产品优势、会员权益、企业服务入口。
 */

// 产品优势数据
const advantages = [
    {
        icon: ShieldCheck,
        title: "500 元/年用真 Claude",
        description: "稳定不封号，比官方节省 95%",
    },
    {
        icon: Zap,
        title: "实战经验，拒绝空谈",
        description: "所有教程来自真实项目开发经验",
    },
    {
        icon: Users,
        title: "御三家模型协同",
        description: "Claude + GPT + Gemini 最佳搭配指南",
    },
    {
        icon: BookOpen,
        title: "持续更新",
        description: "每月 2-3 篇最新教程，紧跟 AI 前沿",
    },
];

// 会员权益数据
const memberBenefits = [
    "所有进阶教程（持续更新）",
    "每月最新热门话题教程",
    "会员专属微信社群",
    "问题优先解答",
    "新课程优先体验",
];

// 企业套餐数据
const enterprisePlans = [
    { name: "AI 咨询诊断", price: "¥19,999", features: "需求调研 · 场景分析 · 技术选型" },
    { name: "AI 系统落地", price: "¥69,999", features: "定制开发 · 员工培训 · 3个月支持" },
    { name: "AI 全面升级", price: "¥299,999", features: "多部门打通 · 私有化部署 · 1年保障" },
];

export default function HomeContent() {
    // 服务端读取推荐教程
    const featuredTutorials = getAllTutorials()
        .filter(t => t.featured)
        .slice(0, 3);

    return (
        <>
            {/* 产品优势 */}
            <section className="py-20 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            为什么选择 AI-xiaobai？
                        </h2>
                        <p className="mt-4 text-lg text-gray-600">
                            真实、省钱、实用——小白也能快速上手
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {advantages.map((item, i) => {
                            const Icon = item.icon;
                            return (
                                <div key={i} className="text-center">
                                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                        <Icon className="h-7 w-7" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                                    <p className="text-sm text-gray-600">{item.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* 推荐教程 */}
            <section className="py-20 bg-gray-50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                                🎓 免费教程
                            </h2>
                            <p className="mt-2 text-lg text-gray-600">
                                从零开始，手把手教你
                            </p>
                        </div>
                        <Button variant="outline" asChild>
                            <Link href="/guide">
                                查看全部 <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {featuredTutorials.map((tutorial) => (
                            <TutorialCard key={tutorial.slug} tutorial={tutorial} />
                        ))}
                    </div>
                </div>
            </section>

            {/* 会员权益 */}
            <section className="py-20 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700 mb-6">
                                <Crown className="h-4 w-4" />
                                年度会员
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-6">
                                ¥499/年，解锁全部内容
                            </h2>
                            <ul className="space-y-4 mb-8">
                                {memberBenefits.map((benefit, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <Sparkles className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-700">{benefit}</span>
                                    </li>
                                ))}
                            </ul>
                            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600" asChild>
                                <Link href="/membership">
                                    立即加入 <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-2xl p-8 border">
                            <div className="text-center">
                                <div className="text-5xl font-bold text-gray-900 mb-2">
                                    ¥499<span className="text-lg text-gray-500 font-normal">/年</span>
                                </div>
                                <p className="text-gray-500 mb-4">平均每月仅 ¥41.6</p>
                                <div className="text-sm text-gray-600 space-y-2">
                                    <p>✓ 比 Claude Pro 便宜 <strong>97%</strong></p>
                                    <p>✓ 比 ChatGPT Plus 便宜 <strong>71%</strong></p>
                                    <p>✓ 买任意课程 = <strong>终身会员</strong></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 企业服务 */}
            <section className="py-20 bg-gray-50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700 mb-6">
                            <Building2 className="h-4 w-4" />
                            企业 AI 服务
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            让您的企业用上 AI
                        </h2>
                        <p className="mt-4 text-lg text-gray-600">
                            从咨询到落地，全程陪伴
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {enterprisePlans.map((plan, i) => (
                            <Card key={i} className="text-center hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                                    <div className="text-3xl font-bold text-gray-900 mt-2">{plan.price}</div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-600 mb-6">{plan.features}</p>
                                    <Button variant="outline" className="w-full" asChild>
                                        <Link href="/enterprise">了解详情</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
