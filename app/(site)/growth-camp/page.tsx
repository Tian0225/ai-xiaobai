import Link from "next/link";
import { CheckCircle2, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { hasActiveMembership, type MembershipProfile } from "@/lib/membership";

export const dynamic = "force-dynamic";

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
        <div className="surface-card rounded-3xl border border-[#d8e6df] p-8 sm:p-10">
          <p className="text-sm text-slate-500">首页 &gt; 会员 &gt; AI 变现实战陪跑</p>
          <h1 className="mt-4 font-display text-4xl leading-tight text-[var(--brand-ink)] sm:text-5xl">
            AI 变现实战陪跑
          </h1>
          <p className="mt-4 max-w-3xl text-base text-slate-600 sm:text-lg">
            面向想把 AI 变成稳定收入的创作者与个体经营者，提供可执行路径、节奏管理与实操反馈。
          </p>

          {isMember ? (
            <div className="mt-6 space-y-6">
              <p className="feedback-success inline-flex rounded-full border border-[#c8ddd6] px-4 py-2 text-sm font-medium">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                会员已解锁：可查看完整项目介绍
              </p>

              <div className="grid gap-4 lg:grid-cols-3">
                <article className="rounded-2xl border border-[#d8e6df] bg-white p-5">
                  <h2 className="text-base font-semibold text-slate-900">模块 1：定位与报价</h2>
                  <p className="mt-2 text-sm text-slate-600">明确细分赛道、产品形态、报价结构，避免低价内卷。</p>
                </article>
                <article className="rounded-2xl border border-[#d8e6df] bg-white p-5">
                  <h2 className="text-base font-semibold text-slate-900">模块 2：内容与转化</h2>
                  <p className="mt-2 text-sm text-slate-600">搭建获客内容矩阵，优化私域转化脚本与成交流程。</p>
                </article>
                <article className="rounded-2xl border border-[#d8e6df] bg-white p-5">
                  <h2 className="text-base font-semibold text-slate-900">模块 3：交付与复购</h2>
                  <p className="mt-2 text-sm text-slate-600">建立标准交付 SOP，提高复购率和口碑传播效率。</p>
                </article>
              </div>

              <div className="rounded-2xl border border-[#d8e6df] bg-[#f8fbf9] p-5">
                <h3 className="text-base font-semibold text-slate-900">当前形式（会员可见）</h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
                  <li>6 周节奏化任务推进，每周目标和复盘。</li>
                  <li>案例拆解 + 作业反馈 + 关键节点答疑。</li>
                  <li>报名与排期采用小批次开放，先到先审。</li>
                </ul>
                <p className="mt-4 text-sm text-slate-600">
                  想加入本期陪跑，请先在会员群内提交「当前阶段 + 目标 + 可投入时间」。
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-[#d8e6df] bg-white/90 p-5">
              <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                <Lock className="h-4 w-4" />
                完整项目介绍仅会员可见
              </p>
              <p className="mt-3 text-sm text-slate-600">
                你当前看到的是公开简介。开通会员后，可查看完整模块、形式和报名说明。
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/membership"
                  className="inline-flex rounded-full bg-[linear-gradient(120deg,#0d3b3a,#3a7d6b)] px-4 py-2 text-sm font-semibold text-white"
                >
                  去开通会员
                </Link>
                <Link
                  href="/guide"
                  className="inline-flex rounded-full border border-[#c8ddd6] bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  先看免费教程
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

