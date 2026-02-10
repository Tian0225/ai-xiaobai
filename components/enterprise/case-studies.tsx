"use client";

import { Building, TrendingUp, Clock, Users } from "lucide-react";

const cases = [
  {
    industry: "制造业",
    company: "某传统制造企业",
    challenge: "生产文档管理混乱，查找效率低",
    solution: "AI 文档智能检索 + 自动分类系统",
    results: [
      { icon: Clock, label: "文档检索时间", value: "减少 80%" },
      { icon: TrendingUp, label: "工作效率", value: "提升 60%" },
      { icon: Users, label: "覆盖员工", value: "200+ 人" },
    ],
  },
  {
    industry: "教育培训",
    company: "某在线教育平台",
    challenge: "学员咨询量大，客服压力大",
    solution: "AI 智能客服 + 知识库问答系统",
    results: [
      { icon: Clock, label: "响应时间", value: "从 5 分钟到 10 秒" },
      { icon: TrendingUp, label: "客服成本", value: "降低 50%" },
      { icon: Users, label: "服务学员", value: "10000+ 人/月" },
    ],
  },
  {
    industry: "金融服务",
    company: "某金融科技公司",
    challenge: "合同审核耗时，法律风险高",
    solution: "AI 合同审核 + 风险预警系统",
    results: [
      { icon: Clock, label: "审核时间", value: "从 2 天到 1 小时" },
      { icon: TrendingUp, label: "准确率", value: "提升到 99%" },
      { icon: Users, label: "处理合同", value: "1000+ 份/月" },
    ],
  },
];

export default function CaseStudies() {
  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            成功案例
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            真实客户案例（已脱敏处理）
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {cases.map((caseStudy, index) => (
            <div
              key={index}
              className="rounded-2xl border border-gray-200 bg-white p-8 hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 mb-4">
                  <Building className="h-4 w-4" />
                  {caseStudy.industry}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {caseStudy.company}
                </h3>
              </div>

              {/* Challenge */}
              <div className="mb-6">
                <div className="text-sm font-semibold text-gray-700 mb-2">
                  挑战：
                </div>
                <p className="text-sm text-gray-600">{caseStudy.challenge}</p>
              </div>

              {/* Solution */}
              <div className="mb-6">
                <div className="text-sm font-semibold text-gray-700 mb-2">
                  解决方案：
                </div>
                <p className="text-sm text-gray-600">{caseStudy.solution}</p>
              </div>

              {/* Results */}
              <div className="border-t pt-6">
                <div className="text-sm font-semibold text-gray-700 mb-4">
                  效果：
                </div>
                <div className="space-y-3">
                  {caseStudy.results.map((result, idx) => {
                    const Icon = result.icon;
                    return (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="rounded-lg bg-green-50 p-2">
                          <Icon className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-gray-500">
                            {result.label}
                          </div>
                          <div className="text-sm font-semibold text-gray-900">
                            {result.value}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            * 案例数据经过脱敏处理，实际效果因企业具体情况而异
          </p>
        </div>
      </div>
    </section>
  );
}
