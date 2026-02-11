"use client";

import Link from "next/link";
import { ArrowRight, Check, Sparkles, Layers3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const features = [
  "500元/年用真 Claude（稳定不封号）",
  "御三家模型（Claude/GPT/Gemini）协同使用",
  "会员每月更新 + 社群答疑",
];

export default function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-hero pt-20 sm:pt-24">
      <div className="absolute -left-16 top-1/3 h-56 w-56 rounded-full bg-[#f4a259]/25 blur-3xl float-soft" />
      <div className="absolute -right-16 top-16 h-56 w-56 rounded-full bg-[#3a7d6b]/25 blur-3xl float-soft" />
      <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-16 pt-8 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-24 lg:pt-16">
        <div className="reveal-up">
          <Badge className="mb-6 border border-[#c8ddd6] bg-white/80 text-[var(--brand-fresh)]">
            Stitch 风格升级中 · 更快上手路径
          </Badge>

          <h1 className="font-display text-4xl leading-tight text-[var(--brand-ink)] sm:text-6xl">
            小白学 AI，
            <br />
            不靠玄学靠流程
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            把复杂的 Claude Code、模型协同与商业化路径，拆成可以立即执行的模块。先学会，再跑通，再放大。
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button size="lg" className="rounded-full bg-[linear-gradient(120deg,#0d3b3a,#3a7d6b)] px-8 hover:opacity-95" asChild>
              <Link href="/guide">
                从免费教程开始
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full border-[#b9d1c9] bg-white/80 px-8" asChild>
              <Link href="/guide/opus-proxy-guide">查看省钱方案</Link>
            </Button>
          </div>

          <div className="mt-10 space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3 text-slate-700 reveal-up">
                <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--brand-fresh)]" />
                <span className="text-sm sm:text-base">{feature}</span>
              </div>
            ))}
          </div>

          <p className="mt-10 text-sm text-slate-500">
            已有 <span className="font-semibold text-slate-800">1000+</span> 用户在这里完成第一条 AI 变现链路
          </p>
        </div>

        <div className="surface-card reveal-up reveal-delay-1 rounded-3xl border border-[#d6e4dd] p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <p className="font-display text-xl text-[var(--brand-ink)]">学习驾驶舱</p>
            <Sparkles className="h-5 w-5 text-[var(--brand-signal)]" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-5">
              <p className="text-xs uppercase tracking-wider text-slate-500">最新路线</p>
              <p className="mt-2 text-2xl font-display text-[var(--brand-ink)]">Opus 4.6</p>
              <p className="mt-1 text-sm text-slate-600">反代稳定方案 + 低成本落地</p>
            </div>
            <div className="rounded-2xl bg-white p-5">
              <p className="text-xs uppercase tracking-wider text-slate-500">本月内容</p>
              <p className="mt-2 text-2xl font-display text-[var(--brand-ink)]">2-3 篇</p>
              <p className="mt-1 text-sm text-slate-600">持续跟进 Agent 与 MCP 生态</p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-dashed border-[#bad2ca] bg-[#f8fbf9] p-5">
            <div className="flex items-center gap-2 text-[var(--brand-fresh)]">
              <Layers3 className="h-4 w-4" />
              <span className="text-sm font-semibold">分层学习模型</span>
            </div>
            <ol className="mt-3 space-y-2 text-sm text-slate-700">
              <li>1. 免费教程搭建第一性理解</li>
              <li>2. 会员内容补全项目化能力</li>
              <li>3. 企业/变现路径落地真实场景</li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
