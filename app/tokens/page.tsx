"use client";

import { useCallback, useEffect, useState } from "react";
import { Coins, Sparkles } from "lucide-react";
import Navbar from "@/components/marketing/navbar";
import { Button } from "@/components/ui/button";
import PaymentForm from "@/components/payment/payment-form";
import { createClient } from "@/lib/supabase/client";

interface ProfileWithToken {
  token_balance: number | null;
}

interface TokenLedgerRecord {
  id: string;
  order_id: string | null;
  biz_type: "token_basic" | "token_pro" | "token_consume";
  change_amount: number;
  balance_after: number;
  note: string | null;
  created_at: string;
}

const TOKEN_BASIC_PRICE = Number(process.env.NEXT_PUBLIC_TOKEN_PACK_BASIC_PRICE ?? 39);
const TOKEN_PRO_PRICE = Number(process.env.NEXT_PUBLIC_TOKEN_PACK_PRO_PRICE ?? 99);

function formatDateTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function bizTypeLabel(type: TokenLedgerRecord["biz_type"]) {
  if (type === "token_basic") return "购买代币100";
  if (type === "token_pro") return "购买代币300";
  return "代币消耗";
}

export default function TokensPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [ledgerRecords, setLedgerRecords] = useState<TokenLedgerRecord[]>([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [selectedPack, setSelectedPack] = useState<"token_basic" | "token_pro" | null>(null);
  const [consumeLoading, setConsumeLoading] = useState(false);
  const [consumeMessage, setConsumeMessage] = useState("");

  const loadTokenData = useCallback(async (userId: string, supabase = createClient()) => {
    const { data: profile } = await supabase.from("profiles").select("token_balance").eq("id", userId).maybeSingle();
    const safeProfile = (profile as ProfileWithToken | null) ?? null;
    const balance = Number(safeProfile?.token_balance ?? 0);
    setTokenBalance(Number.isFinite(balance) ? balance : 0);

    const ledgerResponse = await fetch("/api/tokens/ledger", { cache: "no-store" });
    const ledgerPayload = await ledgerResponse.json().catch(() => ({}));
    if (ledgerResponse.ok) {
      setLedgerRecords(Array.isArray(ledgerPayload.records) ? (ledgerPayload.records as TokenLedgerRecord[]) : []);
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    supabase.auth.getUser().then(async ({ data }) => {
      if (!active) return;
      const user = data.user;
      setUserEmail(user?.email ?? null);

      if (!user) {
        setLoadingUser(false);
        return;
      }

      if (!active) return;
      await loadTokenData(user.id, supabase);
      if (!active) return;
      setLoadingUser(false);
    });

    return () => {
      active = false;
    };
  }, [loadTokenData]);

  const handleTestConsume = async () => {
    if (!userEmail || consumeLoading) return;
    setConsumeLoading(true);
    setConsumeMessage("");
    const requestId = `CONSUME_TEST_${Date.now()}_${Math.floor(Math.random() * 900 + 100)}`;

    try {
      const response = await fetch("/api/tokens/consume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: 10,
          requestId,
          note: "测试扣减 10 代币",
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(typeof payload.error === "string" ? payload.error : "扣减失败");
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.id) {
        await loadTokenData(user.id, supabase);
      }
      setConsumeMessage("测试扣减成功，已更新余额与流水。");
    } catch (error) {
      const message = error instanceof Error ? error.message : "扣减失败";
      setConsumeMessage(message);
    } finally {
      setConsumeLoading(false);
    }
  };

  const selectedConfig =
    selectedPack === "token_basic"
      ? { bizType: "token_basic" as const, amount: TOKEN_BASIC_PRICE, label: "代币 100" }
      : selectedPack === "token_pro"
        ? { bizType: "token_pro" as const, amount: TOKEN_PRO_PRICE, label: "代币 300" }
        : null;

  return (
    <>
      <Navbar />
      <main className="min-h-screen pb-16 pt-28 sm:pt-32">
        <section className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <article className="surface-card rounded-3xl border border-[#d8e6df] p-6 sm:p-8">
            <p className="inline-flex items-center gap-2 rounded-full bg-[#e3f0eb] px-3 py-1 text-xs font-semibold text-[var(--brand-fresh)]">
              <Coins className="h-4 w-4" />
              代币中心
            </p>
            <h1 className="mt-4 font-display text-4xl text-[var(--brand-ink)]">购买代币包</h1>
            <p className="mt-3 text-sm text-slate-600">
              代币用于站内消耗型功能。当前先走人工核销模式，支付后后台确认到账并发放代币。
            </p>

            <div className="mt-5 rounded-2xl border border-[#d8e6df] bg-[#f8fbf9] p-4">
              <p className="text-sm text-slate-600">当前登录账号</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{userEmail ?? "未登录"}</p>
              <p className="mt-3 text-sm text-slate-600">当前代币余额</p>
              <p className="mt-1 text-3xl font-display text-[var(--brand-fresh)]">{tokenBalance}</p>
            </div>

            {!selectedPack ? (
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  onClick={() => setSelectedPack("token_basic")}
                  className="rounded-2xl border border-[#d8e6df] bg-white p-4 text-left hover:border-[#97c3b3]"
                  disabled={loadingUser || !userEmail}
                >
                  <p className="text-sm font-semibold text-slate-900">代币 100</p>
                  <p className="mt-1 text-2xl font-display text-[var(--brand-ink)]">¥{TOKEN_BASIC_PRICE}</p>
                  <p className="mt-1 text-xs text-slate-500">适合低频使用</p>
                </button>
                <button
                  onClick={() => setSelectedPack("token_pro")}
                  className="rounded-2xl border border-[#d8e6df] bg-white p-4 text-left hover:border-[#97c3b3]"
                  disabled={loadingUser || !userEmail}
                >
                  <p className="text-sm font-semibold text-slate-900">代币 300</p>
                  <p className="mt-1 text-2xl font-display text-[var(--brand-ink)]">¥{TOKEN_PRO_PRICE}</p>
                  <p className="mt-1 text-xs text-slate-500">适合高频使用</p>
                </button>
              </div>
            ) : null}

            {!userEmail && !loadingUser ? (
              <p className="mt-5 text-sm text-rose-600">请先登录后再购买代币。</p>
            ) : null}

            {userEmail ? (
              <div className="mt-5 rounded-2xl border border-[#d8e6df] bg-white p-4">
                <p className="text-sm font-semibold text-slate-900">测试消耗</p>
                <p className="mt-1 text-xs text-slate-500">用于联调“余额扣减 + 流水记录”闭环，暂为测试入口。</p>
                <Button
                  variant="outline"
                  className="mt-3"
                  onClick={handleTestConsume}
                  disabled={consumeLoading}
                >
                  {consumeLoading ? "扣减中..." : "测试消耗 10 代币"}
                </Button>
                {consumeMessage ? (
                  <p className="mt-2 text-xs text-slate-600">{consumeMessage}</p>
                ) : null}
              </div>
            ) : null}
          </article>

          <article className="surface-card rounded-3xl border border-[#d8e6df] p-6 sm:p-8">
            {!selectedConfig || !userEmail ? (
              <div className="rounded-2xl border border-[#d8e6df] bg-[#f8fbf9] p-6 text-sm text-slate-600">
                <p className="inline-flex items-center gap-2 font-semibold text-[var(--brand-ink)]">
                  <Sparkles className="h-4 w-4" />
                  请选择代币包并登录账号
                </p>
                <p className="mt-2">下单后请在支付备注填写订单号，后台会按订单号核销并发放代币。</p>
                {selectedPack ? (
                  <Button variant="outline" className="mt-4" onClick={() => setSelectedPack(null)}>
                    重新选择代币包
                  </Button>
                ) : null}
              </div>
            ) : (
              <PaymentForm
                userEmail={userEmail}
                bizType={selectedConfig.bizType}
                amountYuan={selectedConfig.amount}
                productLabel={selectedConfig.label}
                successRedirect="/tokens?payment=success"
              />
            )}
          </article>
        </section>

        <section className="mx-auto mt-8 max-w-6xl px-4 sm:px-6 lg:px-8">
          <article className="surface-card rounded-3xl border border-[#d8e6df] p-6 sm:p-8">
            <h2 className="font-display text-2xl text-[var(--brand-ink)]">最近代币流水</h2>
            <p className="mt-2 text-sm text-slate-600">用于核对每次发放或消耗，便于排查到账问题。</p>

            {ledgerRecords.length === 0 ? (
              <p className="mt-4 rounded-xl border border-[#d8e6df] bg-[#f8fbf9] p-4 text-sm text-slate-600">暂无流水记录</p>
            ) : (
              <div className="mt-4 overflow-hidden rounded-2xl border border-[#d8e6df]">
                <div className="grid grid-cols-[1fr_1fr_1fr_1fr] bg-[#f7faf8] px-4 py-2 text-xs font-semibold text-slate-500">
                  <span>时间</span>
                  <span>类型</span>
                  <span>变动</span>
                  <span>余额</span>
                </div>
                {ledgerRecords.map((item) => (
                  <div key={item.id} className="grid grid-cols-[1fr_1fr_1fr_1fr] border-t border-[#e2ece8] px-4 py-3 text-sm">
                    <span className="text-slate-700">{formatDateTime(item.created_at)}</span>
                    <span className="text-slate-700">{bizTypeLabel(item.biz_type)}</span>
                    <span className={item.change_amount >= 0 ? "font-semibold text-emerald-600" : "font-semibold text-rose-600"}>
                      {item.change_amount >= 0 ? `+${item.change_amount}` : String(item.change_amount)}
                    </span>
                    <span className="font-semibold text-slate-900">{item.balance_after}</span>
                  </div>
                ))}
              </div>
            )}
          </article>
        </section>
      </main>
    </>
  );
}
