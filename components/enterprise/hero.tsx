"use client";

import { ArrowRight, Building2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EnterpriseHero() {
  const scrollToForm = () => {
    const formElement = document.getElementById("consultation-form");
    formElement?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden pb-20 pt-28 sm:pt-32">
      <div className="absolute -left-20 top-20 h-64 w-64 rounded-full bg-[color-mix(in_oklab,var(--uipro-enterprise-cta)_24%,white)] blur-3xl" />
      <div className="absolute -right-20 top-40 h-64 w-64 rounded-full bg-[color-mix(in_oklab,var(--uipro-enterprise-secondary)_24%,white)] blur-3xl" />

      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
        <div className="reveal-up">
          <div className="uipro-enterprise-pill mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold">
            <Building2 className="h-4 w-4" />
            Enterprise AI
          </div>
          <h1 className="font-display text-4xl leading-tight text-[var(--uipro-enterprise-text)] sm:text-6xl">
            让企业 AI 项目
            <br />
            从试点走向规模化
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-[color-mix(in_oklab,var(--uipro-enterprise-text)_68%,white)]">
            我们不止交付模型调用，而是帮你完成需求对齐、流程改造、系统集成与团队迁移，形成可长期复用的 AI 能力。
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button
              size="lg"
              className="uipro-enterprise-cta rounded-full px-8 hover:opacity-95"
              onClick={scrollToForm}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              预约免费诊断
            </Button>
            <Button size="lg" variant="outline" className="uipro-enterprise-outline rounded-full px-8" asChild>
              <a href="#pricing">
                查看服务套餐
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>

        <div className="uipro-enterprise-surface reveal-up reveal-delay-1 rounded-3xl p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Delivery Metrics</p>
          <div className="mt-6 grid grid-cols-1 gap-4">
            <div className="rounded-2xl border border-[color-mix(in_oklab,var(--uipro-enterprise-secondary)_22%,white)] bg-white p-5">
              <div className="text-3xl font-display text-[var(--uipro-enterprise-text)]">3-6个月</div>
              <p className="mt-1 text-sm text-slate-600">平均落地周期</p>
            </div>
            <div className="rounded-2xl border border-[color-mix(in_oklab,var(--uipro-enterprise-secondary)_22%,white)] bg-white p-5">
              <div className="text-3xl font-display text-[var(--uipro-enterprise-text)]">50%+</div>
              <p className="mt-1 text-sm text-slate-600">典型效率提升</p>
            </div>
            <div className="rounded-2xl border border-[color-mix(in_oklab,var(--uipro-enterprise-secondary)_22%,white)] bg-white p-5">
              <div className="text-3xl font-display text-[var(--uipro-enterprise-text)]">20+</div>
              <p className="mt-1 text-sm text-slate-600">覆盖企业场景</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
