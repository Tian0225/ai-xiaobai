"use client";

import { Headphones, Lock, Shield, TrendingUp, Users, Zap } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "数据安全保障",
    description: "支持私有化部署与访问权限隔离，满足企业内部合规要求。",
  },
  {
    icon: Zap,
    title: "快速落地",
    description: "以可执行路线图推进，避免陷入“只做 demo 不上生产”。",
  },
  {
    icon: Users,
    title: "全员培训",
    description: "不仅交付系统，也建立业务方可持续使用能力。",
  },
  {
    icon: Headphones,
    title: "长期支持",
    description: "上线后持续优化关键流程，保障稳定运行与迭代。",
  },
  {
    icon: Lock,
    title: "合规审计",
    description: "输出技术文档与审批材料，降低企业审批阻力。",
  },
  {
    icon: TrendingUp,
    title: "效果追踪",
    description: "建立指标看板，持续验证 AI 投入的真实产出。",
  },
];

export default function EnterpriseFeatures() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14">
          <p className="text-sm font-semibold text-[#1d4ed8]">Execution Principles</p>
          <h2 className="mt-2 font-display text-3xl tracking-tight text-[var(--brand-ink)] sm:text-4xl">
            关注可交付结果，而不是演示效果
          </h2>
          <p className="mt-3 max-w-2xl text-lg text-slate-600">
            从需求澄清到上线运营，每个阶段都有明确输出和验收标准。
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article key={feature.title} className="surface-card rounded-2xl border border-[#dbe7ff] p-7">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f1ff] text-[#1d4ed8]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
