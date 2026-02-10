"use client";

import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "AI 咨询诊断",
    price: "¥19,999",
    description: "快速了解 AI 如何帮助您的业务",
    features: [
      "企业 AI 需求调研（2天）",
      "AI 应用场景分析报告",
      "技术选型建议（Claude/GPT/国产模型）",
      "成本预算方案",
      "ROI 评估",
    ],
    deliverables: [
      "30页诊断报告",
      "技术方案 PPT",
      "1次高管汇报",
    ],
    duration: "1-2周",
    popular: false,
  },
  {
    name: "AI 系统落地",
    price: "¥69,999",
    description: "从零到一搭建您的 AI 系统",
    features: [
      "包含套餐1所有内容",
      "定制开发 AI 工具/系统",
      "  · 智能客服",
      "  · 文档自动化",
      "  · 数据分析助手",
      "  · 内容生成工具",
      "员工培训（2-3场）",
      "3个月技术支持",
    ],
    deliverables: [
      "完整源代码",
      "部署文档",
      "操作手册",
      "培训视频",
    ],
    duration: "1-3个月",
    popular: true,
  },
  {
    name: "AI 全面升级",
    price: "¥299,999",
    description: "企业级 AI 能力全面升级",
    features: [
      "包含套餐2所有内容",
      "多部门 AI 系统打通",
      "私有化部署（数据安全）",
      "定制化模型训练（如有需要）",
      "1年技术支持",
      "按需迭代升级",
    ],
    deliverables: [
      "企业级 AI 平台",
      "私有化部署方案",
      "SOP 文档",
      "长期技术保障",
    ],
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
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            服务套餐
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            灵活的服务方案，满足不同阶段的企业需求
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={cn(
                "relative rounded-3xl border bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl",
                plan.popular
                  ? "border-blue-500 ring-2 ring-blue-500 scale-105"
                  : "border-gray-200"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-1.5 text-sm font-semibold text-white">
                    <Star className="h-4 w-4" />
                    最受欢迎
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                <p className="mt-2 text-sm text-gray-600">{plan.description}</p>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-sm text-gray-500">起</span>
                </div>
              </div>

              <div className="mb-6">
                <div className="text-sm font-semibold text-gray-900 mb-3">服务内容：</div>
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-6 border-t pt-6">
                <div className="text-sm font-semibold text-gray-900 mb-3">交付物：</div>
                <ul className="space-y-2">
                  {plan.deliverables.map((item, idx) => (
                    <li key={idx} className="text-sm text-gray-600">
                      · {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-6">
                <div className="text-sm text-gray-500">
                  周期：<span className="font-semibold text-gray-900">{plan.duration}</span>
                </div>
              </div>

              <Button
                className={cn(
                  "w-full",
                  plan.popular
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    : ""
                )}
                onClick={scrollToForm}
              >
                立即咨询
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-600">
            💡 所有套餐均支持定制化调整，具体价格以实际需求为准
          </p>
        </div>
      </div>
    </section>
  );
}
