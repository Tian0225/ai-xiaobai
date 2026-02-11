"use client";

import { useState, useEffect } from "react";
import { Sparkles, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import PaymentForm from "@/components/payment/payment-form";
import { createClient } from "@/lib/supabase/client";

export default function MembershipPage() {
  const [showPayment, setShowPayment] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setUserEmail(data.user?.email ?? null);
      setLoadingUser(false);
    });

    return () => {
      active = false;
    };
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
                  disabled={loadingUser || !userEmail}
                  onClick={() => setShowPayment(true)}
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  {loadingUser ? "加载账户中..." : userEmail ? "立即开通会员" : "请先登录"}
                </Button>
              ) : !userEmail ? (
                <p className="text-sm text-red-600">未获取到登录邮箱，请刷新后重试。</p>
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
