import Link from "next/link";
import { getAllTutorials } from "@/lib/mdx";
import { TutorialCard } from "@/components/guide/tutorial-card";
import { ArrowRight, Crown, Sparkles, Users, Building2, ShieldCheck, Zap, BookOpen, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

const memberBenefits = [
  "所有进阶教程（持续更新）",
  "每月最新热门话题教程",
  "会员专属微信社群",
  "问题优先解答",
  "新课程优先体验",
];

const enterprisePlans = [
  { name: "AI 咨询诊断", price: "¥19,999", features: "需求调研 · 场景分析 · 技术选型" },
  { name: "AI 系统落地", price: "¥69,999", features: "定制开发 · 员工培训 · 3个月支持" },
  { name: "AI 全面升级", price: "¥299,999", features: "多部门打通 · 私有化部署 · 1年保障" },
];

export default function HomeContent() {
  const featuredTutorials = getAllTutorials()
    .filter((t) => t.featured)
    .slice(0, 3);

  return (
    <>
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="font-display text-3xl tracking-tight text-[var(--brand-ink)] sm:text-4xl">
              用一套可复用系统，替代碎片化试错
            </h2>
            <p className="mt-3 max-w-2xl text-lg text-slate-600">
              Stitch 风格强调模块化组合与快速迭代。这里把它落到学习与业务场景：每个模块可单独使用，也能拼成完整闭环。
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {advantages.map((item, i) => {
              const Icon = item.icon;
              return (
                <article key={i} className="surface-card rounded-2xl border border-[#d8e6df] p-6 reveal-up">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#e3f0eb] text-[var(--brand-fresh)]">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-slate-900">{item.title}</h3>
                  <p className="text-sm text-slate-600">{item.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--brand-fresh)]">FREE TRACK</p>
              <h2 className="mt-1 font-display text-3xl tracking-tight text-[var(--brand-ink)] sm:text-4xl">
                免费教程先打底，再进阶
              </h2>
              <p className="mt-2 text-lg text-slate-600">先跑通核心路径，再做深度优化。</p>
            </div>
            <Button variant="outline" className="rounded-full border-[#b9d1c9] bg-white/70" asChild>
              <Link href="/guide">
                查看全部 <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredTutorials.map((tutorial) => (
              <TutorialCard key={tutorial.slug} tutorial={tutorial} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="surface-card grid grid-cols-1 items-center gap-10 rounded-3xl border border-[#d8e6df] p-8 lg:grid-cols-[1.2fr_0.8fr] lg:p-12">
            <div className="reveal-up">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#e3f0eb] px-4 py-2 text-sm font-semibold text-[var(--brand-fresh)]">
                <Crown className="h-4 w-4" />
                年度会员
              </div>
              <h2 className="font-display text-3xl tracking-tight text-[var(--brand-ink)] sm:text-4xl">
                ¥499/年，解锁持续迭代的实战资源
              </h2>
              <ul className="mt-6 space-y-4">
                {memberBenefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--brand-fresh)]" />
                    <span className="text-slate-700">{benefit}</span>
                  </li>
                ))}
              </ul>
              <Button size="lg" className="mt-8 rounded-full bg-[linear-gradient(120deg,#0d3b3a,#3a7d6b)] hover:opacity-95" asChild>
                <Link href="/membership">
                  立即加入 <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="rounded-2xl bg-[linear-gradient(140deg,#fef7ea,#e7f3ee)] p-8">
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Value Snapshot</p>
              <div className="mt-3 text-5xl font-display text-[var(--brand-ink)]">
                ¥499<span className="text-lg text-slate-500">/年</span>
              </div>
              <p className="mt-2 text-slate-600">平均每月仅 ¥41.6</p>
              <div className="mt-6 space-y-3 text-sm text-slate-700">
                <p>比 Claude Pro 便宜 <strong>97%</strong></p>
                <p>比 ChatGPT Plus 便宜 <strong>71%</strong></p>
                <p>买任意课程即享 <strong>终身会员</strong></p>
              </div>
              <div className="mt-6 rounded-xl border border-[#c7ded6] bg-white/80 p-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-800">适合人群</p>
                <p className="mt-1">想稳定提升效率，并把 AI 应用到真实业务的人。</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#e6f2ec] px-4 py-2 text-sm font-semibold text-[var(--brand-fresh)]">
              <Building2 className="h-4 w-4" />
              企业 AI 服务
            </div>
            <h2 className="mt-6 font-display text-3xl tracking-tight text-[var(--brand-ink)] sm:text-4xl">
              从咨询到落地，给企业一条可执行路线
            </h2>
            <p className="mt-3 text-lg text-slate-600">对齐业务目标、建设工具链、完成团队迁移。</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {enterprisePlans.map((plan, i) => (
              <Card key={i} className="surface-card rounded-2xl border-[#d8e6df] text-left transition-transform hover:-translate-y-1">
                <CardHeader>
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#e3f0eb] text-[var(--brand-fresh)]">
                    <Handshake className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl text-[var(--brand-ink)]">{plan.name}</CardTitle>
                  <div className="mt-2 text-3xl font-display text-slate-900">{plan.price}</div>
                </CardHeader>
                <CardContent>
                  <p className="mb-6 text-sm text-slate-600">{plan.features}</p>
                  <Button variant="outline" className="w-full rounded-full border-[#b9d1c9] bg-white/80" asChild>
                    <Link href="/enterprise">了解详情</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Button className="rounded-full bg-[linear-gradient(120deg,#0d3b3a,#3a7d6b)] px-8 hover:opacity-95" asChild>
              <Link href="/enterprise">
                查看企业案例与预约入口
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
