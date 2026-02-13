import EnterpriseHero from "@/components/enterprise/hero";
import PricingPlans from "@/components/enterprise/pricing-plans";
import CaseStudies from "@/components/enterprise/case-studies";
import ConsultationForm from "@/components/enterprise/consultation-form";
import EnterpriseFeatures from "@/components/enterprise/features";

export const metadata = {
  title: "企业 AI 服务 - AI-xiaobai",
  description: "让您的企业用上 AI，从咨询到落地，全程陪伴。提供 AI 咨询诊断、系统落地、全面升级三大套餐。",
  keywords: ["企业AI服务", "AI咨询", "AI系统落地", "企业数字化转型", "Claude企业版"],
};

export default function EnterprisePage() {
  return (
      <div className="min-h-screen pt-24">
        <EnterpriseHero />
        <EnterpriseFeatures />
        <PricingPlans />
        <CaseStudies />
        <ConsultationForm />
      </div>
  );
}
