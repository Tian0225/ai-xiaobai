"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, Sparkles } from "lucide-react";

export default function EnterpriseHero() {
  const scrollToForm = () => {
    const formElement = document.getElementById("consultation-form");
    formElement?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-blue-100 p-4">
              <Building2 className="h-12 w-12 text-blue-600" />
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            让您的企业用上 AI
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              从咨询到落地，全程陪伴
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-xl max-w-3xl mx-auto">
            专业的 AI 落地服务团队，帮助传统企业快速接入 AI 能力
            <br />
            <span className="font-semibold text-gray-900">
              不是简单的模型调用，而是真正提升企业效率的完整解决方案
            </span>
          </p>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3 max-w-3xl mx-auto">
            <div className="rounded-lg bg-white p-6 shadow-sm border">
              <div className="text-3xl font-bold text-blue-600">100%</div>
              <div className="mt-2 text-sm text-gray-600">客户满意度</div>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm border">
              <div className="text-3xl font-bold text-blue-600">3-6个月</div>
              <div className="mt-2 text-sm text-gray-600">平均落地周期</div>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm border">
              <div className="text-3xl font-bold text-blue-600">50%+</div>
              <div className="mt-2 text-sm text-gray-600">平均效率提升</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="mt-12 flex items-center justify-center gap-4 flex-wrap">
            <Button size="lg" className="text-base px-8" onClick={scrollToForm}>
              <Sparkles className="mr-2 h-5 w-5" />
              预约免费诊断
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8" asChild>
              <a href="#pricing">
                查看服务套餐 <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>

          {/* Trust Signals */}
          <p className="mt-8 text-sm text-gray-500">
            已为 <span className="font-semibold text-gray-900">20+</span> 家企业提供 AI 服务
            · 覆盖制造、零售、教育、金融等行业
          </p>
        </div>
      </div>

      {/* Decorative Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />
      </div>
    </section>
  );
}
