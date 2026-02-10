"use client";

import { Shield, Zap, Users, Headphones, Lock, TrendingUp } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "数据安全保障",
    description: "私有化部署方案，您的数据永不出域，符合国家数据安全法规要求",
  },
  {
    icon: Zap,
    title: "快速落地",
    description: "经验丰富的团队，3-6个月完成从诊断到上线的全流程",
  },
  {
    icon: Users,
    title: "全员培训",
    description: "不只是交付系统，更培训您的团队真正用起来",
  },
  {
    icon: Headphones,
    title: "长期支持",
    description: "项目结束后持续技术支持，确保系统稳定运行",
  },
  {
    icon: Lock,
    title: "合规审计",
    description: "协助完成企业内部合规审批，提供完整的技术文档",
  },
  {
    icon: TrendingUp,
    title: "持续优化",
    description: "根据使用数据持续优化模型效果，让 AI 越用越好",
  },
];

export default function EnterpriseFeatures() {
  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            为什么选择我们？
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            不是简单的技术服务商，而是您的 AI 转型伙伴
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative rounded-2xl border border-gray-200 p-8 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="mb-4 inline-flex rounded-lg bg-blue-50 p-3 text-blue-600 group-hover:bg-blue-100 transition-colors">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
