"use client";

import { Building, Clock, TrendingUp, Users } from "lucide-react";

const cases = [
  {
    industry: "制造业",
    company: "某传统制造企业",
    challenge: "生产文档分散，知识复用率低",
    solution: "AI 文档检索 + 自动分类工作流",
    results: [
      { icon: Clock, label: "检索时间", value: "减少 80%" },
      { icon: TrendingUp, label: "效率提升", value: "提升 60%" },
      { icon: Users, label: "覆盖员工", value: "200+ 人" },
    ],
  },
  {
    industry: "教育培训",
    company: "某在线教育平台",
    challenge: "咨询量增长导致人工客服压力过高",
    solution: "智能客服 + 业务知识库问答",
    results: [
      { icon: Clock, label: "响应时延", value: "5分钟→10秒" },
      { icon: TrendingUp, label: "客服成本", value: "降低 50%" },
      { icon: Users, label: "服务学员", value: "10000+/月" },
    ],
  },
  {
    industry: "金融服务",
    company: "某金融科技公司",
    challenge: "合同审核流程慢，风险识别依赖人工",
    solution: "AI 合同审核 + 风险预警系统",
    results: [
      { icon: Clock, label: "审核周期", value: "2天→1小时" },
      { icon: TrendingUp, label: "审核准确率", value: "提升至 99%" },
      { icon: Users, label: "月处理量", value: "1000+ 份" },
    ],
  },
];

export default function CaseStudies() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 text-center">
          <h2 className="font-display text-3xl tracking-tight text-[var(--brand-ink)] sm:text-4xl">行业案例</h2>
          <p className="mt-3 text-lg text-slate-600">真实项目脱敏后整理，可用于评估落地预期。</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {cases.map((caseStudy) => (
            <article key={caseStudy.company} className="surface-card rounded-2xl border border-[#dbe7ff] p-7">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#e8f1ff] px-3 py-1 text-sm font-medium text-[#1d4ed8]">
                <Building className="h-4 w-4" />
                {caseStudy.industry}
              </div>
              <h3 className="text-xl font-semibold text-slate-900">{caseStudy.company}</h3>

              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">挑战</p>
                  <p className="mt-1 text-sm text-slate-700">{caseStudy.challenge}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">解决方案</p>
                  <p className="mt-1 text-sm text-slate-700">{caseStudy.solution}</p>
                </div>
              </div>

              <div className="mt-6 border-t border-[#dbe7ff] pt-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">结果</p>
                <div className="mt-3 space-y-3">
                  {caseStudy.results.map((result) => {
                    const Icon = result.icon;
                    return (
                      <div key={result.label} className="flex items-center gap-3 rounded-xl bg-white/90 p-3">
                        <div className="rounded-lg bg-[#e8f1ff] p-2">
                          <Icon className="h-4 w-4 text-[#1d4ed8]" />
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">{result.label}</div>
                          <div className="text-sm font-semibold text-slate-900">{result.value}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
