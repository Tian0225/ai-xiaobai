import Link from "next/link";
import { ArrowLeft, ClipboardCheck } from "lucide-react";
import ApplicationForm from "@/components/growth-camp/application-form";

export const metadata = {
  title: "AI变现陪跑报名 - AI-xiaobai",
  description: "提交 AI 变现实战陪跑报名意向，进入当期评估与排期。",
};

export default function GrowthCampApplyPage() {
  return (
    <main className="min-h-screen pb-20 pt-28 sm:pt-32">
      <section className="layout-grid">
        <div className="mb-8 rounded-3xl border border-[#d8e6df] bg-white/80 p-6 sm:p-8">
          <p className="text-sm text-slate-500">首页 &gt; AI 变现陪跑 &gt; 报名意向</p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#e3f0eb] px-4 py-2 text-sm font-semibold text-[var(--brand-fresh)]">
            <ClipboardCheck className="h-4 w-4" />
            报名评估入口
          </div>
          <h1 className="mt-4 font-display text-4xl leading-tight text-[var(--brand-ink)] sm:text-5xl">
            AI 变现实战陪跑报名
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            这不是先付费再摸索，而是先评估是否匹配，再安排进入对应批次，帮助你稳步推进。
          </p>

          <Link
            href="/growth-camp"
            className="mt-5 inline-flex items-center rounded-full border border-[#b9d1c9] bg-white px-4 py-2 text-sm font-semibold text-slate-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回陪跑介绍
          </Link>
        </div>

        <ApplicationForm />
      </section>
    </main>
  );
}
