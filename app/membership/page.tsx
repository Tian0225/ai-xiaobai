"use client";

import { useState, useEffect } from "react";
import { Check, Sparkles, Zap, Users, BookOpen, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import PaymentForm from "@/components/payment/payment-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const membershipBenefits = [
  {
    icon: BookOpen,
    title: "所有进阶教程",
    description: "解锁全部会员专属教程，持续更新中",
  },
  {
    icon: Sparkles,
    title: "每月最新教程",
    description: "Agent Teams、Clawdbot、最新 MCP 等热门话题",
  },
  {
    icon: Users,
    title: "专属社群",
    description: "加入微信会员群，与其他开发者交流学习",
  },
  {
    icon: Zap,
    title: "问题优先解答",
    description: "遇到问题时获得优先技术支持",
  },
  {
    icon: Crown,
    title: "新课程优先体验",
    description: "新推出的实战课程可优先试听体验",
  },
];

const pricingComparison = [
  { feature: "免费教程", free: true, member: true },
  { feature: "进阶教程（30+ 篇）", free: false, member: true },
  { feature: "每月最新教程（2-3篇）", free: false, member: true },
  { feature: "会员专属社群", free: false, member: true },
  { feature: "问题优先解答", free: false, member: true },
  { feature: "新课程优先体验", free: false, member: true },
];

export default function MembershipPage() {
  const [showPayment, setShowPayment] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const mockEmail = "user@example.com";
    setUserEmail(mockEmail);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700 mb-6">
              <Crown className="h-4 w-4" />
              年度会员
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl mb-6">
              解锁全部进阶内容
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                持续学习，快速成长
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8">
              一次订阅，全年无限访问所有会员内容
            </p>

            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-blue-200 max-w-md mx-auto mb-8">
              <div className="mb-6">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-bold text-gray-900">¥499</span>
                  <span className="text-gray-500">/年</span>
                </div>
              </div>

              {!showPayment ? (
                <Button
                  size="lg"
                  className="w-full text-lg py-6 bg-gradient-to-r from-blue-600 to-purple-600"
                  onClick={() => setShowPayment(true)}
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  立即开通会员
                </Button>
              ) : (
                <PaymentForm userEmail={userEmail} />
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
