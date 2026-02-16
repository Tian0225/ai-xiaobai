"use client";

import { ArrowRight, Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "AI 咨询诊断",
    price: "¥19,999",
    description: "快速识别 AI 落地机会和优先路径",
    features: ["需求调研", "场景分析", "技术选型建议", "预算与 ROI 评估"],
    deliverables: ["30页诊断报告", "技术方案PPT", "高管汇报"],
    duration: "1-2周",
    popular: false,
  },
  {
    name: "AI 系统落地",
    price: "¥69,999",
    description: "从方案到系统上线的完整实施",
    features: ["含咨询诊断", "定制工具开发", "员工培训", "3个月技术支持"],
    deliverables: ["完整源代码", "部署文档", "操作手册", "培训材料"],
    duration: "1-3个月",
    popular: true,
  },
  {
    name: "AI 全面升级",
    price: "¥299,999",
    description: "多部门协同与企业级能力建设",
    features: ["含系统落地", "多部门打通", "私有化部署", "一年持续优化"],
    deliverables: ["企业级平台", "私有化方案", "SOP文档", "长期保障"],
    duration: "3-6个月",
    popular: false,
  },
];

export default function PricingPlans() {
  const scrollToForm = () => {
    const formElement = document.getElementById("consultation-form");
    formElement?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="pricing" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 text-center">
          <h2 className="font-display text-3xl tracking-tight text-[var(--brand-ink)] sm:text-4xl">服务套餐</h2>
          <p className="mt-3 text-lg text-slate-600">按企业阶段分层配置，支持定制化扩展。</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={cn(
                "surface-card relative rounded-3xl border border-[#d8e6df] p-7",
                plan.popular && "ring-2 ring-[#80b7a8]"
              )}
            >
              {plan.popular && (
                <span className="absolute -top-4 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-[linear-gradient(120deg,#0d3b3a,#3a7d6b)] px-4 py-1.5 text-xs font-semibold text-white">
                  <Star className="h-3.5 w-3.5" />
                  推荐方案
                </span>
              )}

              <h3 className="font-display text-2xl text-[var(--brand-ink)]">{plan.name}</h3>
              <p className="mt-2 text-sm text-slate-600">{plan.description}</p>
              <div className="mt-4 text-4xl font-display text-slate-900">{plan.price}</div>
              <p className="mt-1 text-sm text-slate-500">周期：{plan.duration}</p>

              <div className="mt-6">
                <p className="text-sm font-semibold text-slate-900">服务内容</p>
                <ul className="mt-3 space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-slate-700">
                      <Check className="mt-0.5 h-4 w-4 text-[var(--brand-fresh)]" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 border-t border-[#d8e6df] pt-5">
                <p className="text-sm font-semibold text-slate-900">交付物</p>
                <ul className="mt-3 space-y-1 text-sm text-slate-600">
                  {plan.deliverables.map((item) => (
                    <li key={item}>· {item}</li>
                  ))}
                </ul>
              </div>

              <Button
                className={cn(
                  "mt-7 w-full rounded-full",
                  plan.popular
                    ? "bg-[linear-gradient(120deg,#0d3b3a,#3a7d6b)] hover:opacity-95"
                    : "bg-white text-slate-900 border border-[#b9d1c9] hover:bg-[#f7fbf9]"
                )}
                onClick={scrollToForm}
              >
                立即咨询
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
