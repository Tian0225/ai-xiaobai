import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, Lock, Rocket, Sparkles, Target, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { hasActiveMembership, type MembershipProfile } from "@/lib/membership";

export const dynamic = "force-dynamic";

const outcomes = [
  "找到适合自己的 AI 变现切入口，不再盲目跟风",
  "搭建可执行的产品与报价模型，减少低价内卷",
  "明确获客与转化节奏，形成稳定推进机制",
];

const beginnerPath = [
  {
    title: "第 1 步：现状诊断",
    detail: "梳理你的能力、时间和资源，定位最有机会的变现方向。",
  },
  {
    title: "第 2 步：报名评估",
    detail: "提交目标与投入时间，匹配适合你的陪跑批次与节奏。",
  },
  {
    title: "第 3 步：执行陪跑",
    detail: "按周完成任务，获得案例拆解、作业反馈与关键节点答疑。",
  },
  {
    title: "第 4 步：复盘放大",
    detail: "沉淀 SOP 与模板，优化成交率与复购路径。",
  },
];

const schedule = [
  { week: "第 1-2 周", focus: "定位与报价", note: "确定细分赛道、产品形态、报价结构" },
  { week: "第 3-4 周", focus: "内容与转化", note: "搭建内容漏斗，优化私域转化脚本" },
  { week: "第 5-6 周", focus: "交付与复购", note: "形成交付 SOP，提高复购与口碑传播" },
];

export default async function GrowthCampPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isMember = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_member, membership_expires_at")
      .eq("id", user.id)
      .maybeSingle();

    isMember = hasActiveMembership((profile as MembershipProfile | null) ?? null);
  }

  return (
    <main className="min-h-screen pb-20 pt-28 sm:pt-32">
      <section className="layout-grid">
        <div className="surface-card rounded-3xl border border-[#d8e6df] p-6 sm:p-8 lg:p-10">
          <p className="text-sm text-slate-500">首页 &gt; AI 变现陪跑</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#e3f0eb] px-4 py-2 text-sm font-semibold text-[var(--brand-fresh)]">
              <Rocket className="h-4 w-4" />
              AI 变现实战陪跑
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#d8e6df] bg-white px-4 py-2 text-sm font-medium text-slate-600">
              <Clock3 className="h-4 w-4" />
              6 周节奏化执行
            </span>
          </div>

          <h1 className="mt-5 max-w-4xl font-display text-4xl leading-tight text-[var(--brand-ink)] sm:text-5xl">
            给新手的一条清晰路径：
            <br />
            从 AI 兴趣到第一条可复用收入链路
          </h1>
          <p className="mt-4 max-w-3xl text-base text-slate-600 sm:text-lg">
            你不需要先成为专家。我们用可执行流程，带你把定位、获客、交付和复购连起来，避免反复试错。
          </p>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {outcomes.map((item) => (
              <article key={item} className="rounded-2xl border border-[#d8e6df] bg-white p-5">
                <p className="flex items-start gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--brand-fresh)]" />
                  {item}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(120deg,#0d3b3a,#3a7d6b)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
            >
              先咨询是否适合
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full border border-[#b9d1c9] bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-[#f4faf7]"
            >
              提交报名意向
            </Link>
            <Link
              href="/membership"
              className="inline-flex items-center justify-center rounded-full border border-[#b9d1c9] bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-[#f4faf7]"
            >
              开通会员解锁完整说明
            </Link>
          </div>
        </div>
      </section>

      <section className="layout-grid mt-10">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="surface-card rounded-3xl border border-[#d8e6df] p-6 sm:p-8">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#f0f7f4] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-fresh)]">
              <Target className="h-4 w-4" />
              新手执行路径
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {beginnerPath.map((step) => (
                <div key={step.title} className="rounded-2xl border border-[#d8e6df] bg-white p-5">
                  <p className="text-sm font-semibold text-[var(--brand-ink)]">{step.title}</p>
                  <p className="mt-2 text-sm text-slate-600">{step.detail}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="surface-card rounded-3xl border border-[#d8e6df] p-6 sm:p-8">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#fef7ea] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#a16207]">
              <Users className="h-4 w-4" />
              陪跑节奏
            </div>
            <div className="space-y-4">
              {schedule.map((item) => (
                <div key={item.week} className="rounded-2xl border border-[#d8e6df] bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{item.week}</p>
                  <p className="mt-1 text-base font-semibold text-slate-900">{item.focus}</p>
                  <p className="mt-1 text-sm text-slate-600">{item.note}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="layout-grid mt-10">
        {isMember ? (
          <div className="rounded-3xl border border-[#c8ddd6] bg-[#f7fbf9] p-6 sm:p-8">
            <p className="feedback-success inline-flex rounded-full border border-[#c8ddd6] px-4 py-2 text-sm font-medium">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              会员已解锁：完整报名与执行说明
            </p>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <article className="rounded-2xl border border-[#d8e6df] bg-white p-5">
                <h2 className="text-base font-semibold text-slate-900">模块 1：定位与报价</h2>
                <p className="mt-2 text-sm text-slate-600">明确产品与价格区间，建立可持续交付边界。</p>
              </article>
              <article className="rounded-2xl border border-[#d8e6df] bg-white p-5">
                <h2 className="text-base font-semibold text-slate-900">模块 2：内容与转化</h2>
                <p className="mt-2 text-sm text-slate-600">获得可复用内容模板与成交脚本，形成稳定转化动作。</p>
              </article>
              <article className="rounded-2xl border border-[#d8e6df] bg-white p-5">
                <h2 className="text-base font-semibold text-slate-900">模块 3：交付与复购</h2>
                <p className="mt-2 text-sm text-slate-600">搭建交付 SOP 与复盘机制，提升复购和转介绍概率。</p>
              </article>
            </div>

            <div className="mt-5 rounded-2xl border border-[#d8e6df] bg-white p-5">
              <p className="text-sm text-slate-700">
                当前采用小批次报名与排期。请先在会员群内提交「当前阶段 + 目标 + 每周可投入时间」，审核后进入当期陪跑。
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-[#d8e6df] bg-white/90 p-6 sm:p-8">
            <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
              <Lock className="h-4 w-4" />
              完整项目与报名细则仅会员可见
            </p>
            <p className="mt-3 text-sm text-slate-600">
              你当前看到的是公开版路径。开通会员后，可查看完整模块、每周任务模板和当期报名规则。
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/membership"
                className="inline-flex rounded-full bg-[linear-gradient(120deg,#0d3b3a,#3a7d6b)] px-4 py-2 text-sm font-semibold text-white"
              >
                去开通会员
              </Link>
              <Link
                href="/contact"
                className="inline-flex rounded-full border border-[#c8ddd6] bg-white px-4 py-2 text-sm font-semibold text-slate-700"
              >
                先咨询再决定
              </Link>
            </div>
            <div className="mt-5 rounded-2xl border border-[#d8e6df] bg-[#f8fbf9] p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-800">你将解锁</p>
              <p className="mt-1">分阶段任务清单、周复盘框架、案例拆解与关键节点答疑规则。</p>
              <p className="mt-2 inline-flex items-center gap-2 text-[var(--brand-fresh)]">
                <Sparkles className="h-4 w-4" />
                更少试错，更快跑通第一条收入链路
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
