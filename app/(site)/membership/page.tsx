"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, CheckCircle2, Crown, MessageCircle, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import PaymentForm from "@/components/payment/payment-form";
import { createClient } from "@/lib/supabase/client";
import { hasActiveMembership } from "@/lib/membership";

const MEMBERSHIP_PRICE = Number(process.env.NEXT_PUBLIC_MEMBERSHIP_PRICE ?? 499);

const benefits = [
  {
    icon: BookOpen,
    title: "进阶教程全量解锁",
    description: "覆盖 Agent 工作流、MCP 组合、实战项目拆解。",
  },
  {
    icon: TrendingUp,
    title: "每月主题更新",
    description: "持续追踪模型和工具变化，减少过时学习成本。",
  },
  {
    icon: MessageCircle,
    title: "社群优先答疑",
    description: "遇到卡点时，优先获得解决路径与实操建议。",
  },
];

const comparison = [
  { feature: "免费教程", free: "有限", member: "全部" },
  { feature: "进阶实战案例", free: "不可见", member: "持续更新" },
  { feature: "模型协同方案", free: "基础", member: "完整模板" },
  { feature: "社群答疑", free: "无", member: "优先支持" },
];

interface MemberProfile {
  is_member: boolean;
  membership_expires_at: string | null;
}

function formatDate(dateString: string | null) {
  if (!dateString) return "未设置";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "未设置";
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export default function MembershipPage() {
  const [showPayment, setShowPayment] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [memberProfile, setMemberProfile] = useState<MemberProfile | null>(null);
  const monthlyPrice = Number.isFinite(MEMBERSHIP_PRICE)
    ? (MEMBERSHIP_PRICE / 12).toFixed(1)
    : "41.6";
  const isMemberActive = hasActiveMembership(memberProfile);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    supabase.auth.getUser().then(async ({ data }) => {
      if (!active) return;
      const user = data.user;
      setUserEmail(user?.email ?? null);

      if (!user) {
        setMemberProfile(null);
        setLoadingUser(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_member, membership_expires_at")
        .eq("id", user.id)
        .maybeSingle();

      if (!active) return;
      setMemberProfile((profile as MemberProfile | null) ?? null);
      setLoadingUser(false);
    });

    return () => {
      active = false;
    };
  }, []);

  return (
      <div className="min-h-screen pb-20 pt-28 sm:pt-32">
      <section className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
        <div className="reveal-up">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#e3f0eb] px-4 py-2 text-sm font-semibold text-[var(--brand-fresh)]">
            <Crown className="h-4 w-4" />
            年度会员
          </div>

          <h1 className="font-display text-4xl leading-tight text-[var(--brand-ink)] sm:text-5xl">
            一次订阅，
            <br />
            全年获得可执行增长路径
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-600">
            不是只看教程，而是持续获得可落地的方法、模板与反馈，帮助你把 AI 真正用到业务和项目里。
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {benefits.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="surface-card rounded-2xl border border-[#d8e6df] p-5">
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#e3f0eb] text-[var(--brand-fresh)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-base font-semibold text-slate-900">{item.title}</h2>
                  <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                </article>
              );
            })}
          </div>
        </div>

        <div className="surface-card rounded-3xl border border-[#d8e6df] p-6 sm:p-8 reveal-up reveal-delay-1">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Membership</p>
          <div className="mt-3 text-5xl font-display text-[var(--brand-ink)]">
            ¥{MEMBERSHIP_PRICE}<span className="text-lg text-slate-500">/年</span>
          </div>
          <p className="mt-2 text-sm text-slate-600">平均每月 ¥{monthlyPrice}，持续获得增量内容。</p>

          {isMemberActive ? (
            <div className="mt-6 rounded-2xl border border-[#b7e0d0] bg-[#eef9f4] p-5">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#1f7a56]">
                <CheckCircle2 className="h-4 w-4" />
                会员已开通
              </p>
              <p className="mt-3 text-sm text-slate-700">
                当前账号：<span className="font-medium">{userEmail}</span>
              </p>
              <p className="mt-1 text-sm text-slate-700">
                到期时间：<span className="font-medium">{formatDate(memberProfile?.membership_expires_at ?? null)}</span>
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button className="rounded-full bg-[linear-gradient(120deg,#0d3b3a,#3a7d6b)] hover:opacity-95" asChild>
                  <Link href="/guide/member">查看会员内容</Link>
                </Button>
                <Button variant="outline" className="rounded-full border-[#b9d1c9] bg-white/80" asChild>
                  <Link href="/guide">继续学习</Link>
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="mt-6 rounded-2xl border border-[#c8ddd6] bg-white/80 p-4">
                {!showPayment ? (
                  <Button
                    size="lg"
                    className="w-full rounded-full bg-[linear-gradient(120deg,#0d3b3a,#3a7d6b)] hover:opacity-95"
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

              <p className="mt-4 text-xs text-slate-500">
                支付完成后请保留订单号。系统会自动刷新状态；若仍未开通，请联系客服人工核销。
              </p>
            </>
          )}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="surface-card overflow-hidden rounded-3xl border border-[#d8e6df]">
          <div className="border-b border-[#d8e6df] px-6 py-5">
            <h2 className="font-display text-2xl text-[var(--brand-ink)]">权益对比</h2>
          </div>
          <div className="grid grid-cols-[1.2fr_0.9fr_0.9fr] bg-[#f8fbf9] px-6 py-3 text-sm font-semibold text-slate-600">
            <span>项目</span>
            <span>免费用户</span>
            <span>会员</span>
          </div>
          {comparison.map((row) => (
            <div
              key={row.feature}
              className="grid grid-cols-[1.2fr_0.9fr_0.9fr] border-t border-[#d8e6df] px-6 py-4 text-sm"
            >
              <span className="text-slate-800">{row.feature}</span>
              <span className="text-slate-500">{row.free}</span>
              <span className="font-semibold text-[var(--brand-fresh)]">{row.member}</span>
            </div>
          ))}
        </div>
      </section>
      </div>
  );
}
