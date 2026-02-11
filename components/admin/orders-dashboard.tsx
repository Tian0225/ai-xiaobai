"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PaymentMethod = "wechat" | "alipay";
type OrderStatus = "pending" | "paid" | "expired" | "cancelled";

interface OrderRecord {
  order_id: string;
  user_email: string;
  amount: number;
  payment_method: PaymentMethod;
  status: OrderStatus;
  transaction_id: string | null;
  created_at: string;
  paid_at: string | null;
  expires_at: string;
}

interface OrdersResponse {
  orders: OrderRecord[];
  fetchedAt: string;
}

interface OrdersDashboardProps {
  adminEmail: string;
}

const paymentMethodLabel: Record<PaymentMethod, string> = {
  wechat: "微信",
  alipay: "支付宝",
};

const statusLabel: Record<OrderStatus, string> = {
  pending: "待确认",
  paid: "已支付",
  expired: "已过期",
  cancelled: "已取消",
};

function formatDate(iso: string | null) {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function OrdersDashboard({ adminEmail }: OrdersDashboardProps) {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [actionErrors, setActionErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});
  const [transactionInputs, setTransactionInputs] = useState<Record<string, string>>({});

  const loadOrders = useCallback(async (showLoading = false) => {
    if (showLoading) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setErrorMessage("");

    try {
      const response = await fetch("/api/admin/orders", { method: "GET" });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || "获取订单失败");
      }

      const data = payload as OrdersResponse;
      setOrders(data.orders ?? []);
    } catch (error) {
      const message = error instanceof Error ? error.message : "获取订单失败";
      setErrorMessage(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const pendingOrders = useMemo(
    () => orders.filter((order) => order.status === "pending"),
    [orders]
  );

  const summary = useMemo(() => {
    return orders.reduce(
      (acc, order) => {
        acc.total += 1;
        acc[order.status] += 1;
        return acc;
      },
      {
        total: 0,
        pending: 0,
        paid: 0,
        expired: 0,
        cancelled: 0,
      }
    );
  }, [orders]);

  const handleConfirm = async (orderId: string) => {
    const transactionId = (transactionInputs[orderId] ?? "").trim();

    setSubmitting((prev) => ({ ...prev, [orderId]: true }));
    setActionErrors((prev) => ({ ...prev, [orderId]: "" }));
    setSuccessMessage("");

    try {
      const response = await fetch("/api/orders/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          transactionId: transactionId || undefined,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "确认支付失败");
      }

      setSuccessMessage(`订单 ${orderId} 已确认支付并开通会员`);
      setTransactionInputs((prev) => ({ ...prev, [orderId]: "" }));
      await loadOrders(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "确认支付失败";
      setActionErrors((prev) => ({ ...prev, [orderId]: message }));
    } finally {
      setSubmitting((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <section className="surface-card rounded-3xl border border-[#d8e6df] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Admin Console</p>
            <h1 className="mt-2 font-display text-3xl text-[var(--brand-ink)]">订单人工核销后台</h1>
            <p className="mt-2 text-sm text-slate-600">
              当前管理员：{adminEmail}。请先在微信/支付宝核对到账，再点击确认支付。
            </p>
          </div>
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => loadOrders(true)}
            disabled={refreshing || loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            刷新订单
          </Button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-[#d8e6df] bg-white/85 p-4">
            <p className="text-xs text-slate-500">总订单</p>
            <p className="mt-1 text-2xl font-display text-slate-900">{summary.total}</p>
          </div>
          <div className="rounded-2xl border border-[#d8e6df] bg-white/85 p-4">
            <p className="text-xs text-slate-500">待确认</p>
            <p className="mt-1 text-2xl font-display text-amber-600">{summary.pending}</p>
          </div>
          <div className="rounded-2xl border border-[#d8e6df] bg-white/85 p-4">
            <p className="text-xs text-slate-500">已支付</p>
            <p className="mt-1 text-2xl font-display text-emerald-600">{summary.paid}</p>
          </div>
          <div className="rounded-2xl border border-[#d8e6df] bg-white/85 p-4">
            <p className="text-xs text-slate-500">过期/取消</p>
            <p className="mt-1 text-2xl font-display text-slate-500">{summary.expired + summary.cancelled}</p>
          </div>
        </div>

        {successMessage && (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}
      </section>

      <section className="surface-card rounded-3xl border border-[#d8e6df] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Clock3 className="h-5 w-5 text-amber-500" />
            待人工确认（{pendingOrders.length}）
          </h2>
        </div>

        {loading ? (
          <p className="rounded-2xl border border-dashed border-[#d8e6df] p-6 text-sm text-slate-500">
            正在加载订单...
          </p>
        ) : pendingOrders.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[#d8e6df] p-6 text-sm text-slate-500">
            当前没有待确认订单。
          </p>
        ) : (
          <div className="space-y-3">
            {pendingOrders.map((order) => (
              <article
                key={order.order_id}
                className="rounded-2xl border border-[#d8e6df] bg-white/80 p-4"
              >
                <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_auto] lg:items-end">
                  <div>
                    <p className="text-xs text-slate-500">订单号</p>
                    <p className="font-mono text-sm text-slate-900">{order.order_id}</p>
                    <p className="mt-1 text-xs text-slate-500">用户：{order.user_email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">金额 / 支付方式</p>
                    <p className="text-sm font-semibold text-slate-900">
                      ¥{order.amount} · {paymentMethodLabel[order.payment_method]}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">创建：{formatDate(order.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">交易号（可选）</p>
                    <Input
                      value={transactionInputs[order.order_id] ?? ""}
                      onChange={(event) =>
                        setTransactionInputs((prev) => ({
                          ...prev,
                          [order.order_id]: event.target.value,
                        }))
                      }
                      placeholder="MANUAL_TXN_001"
                      className="mt-1"
                    />
                    <p className="mt-1 text-xs text-slate-500">过期：{formatDate(order.expires_at)}</p>
                  </div>
                  <div>
                    <Button
                      className="w-full rounded-full bg-[linear-gradient(120deg,#0d3b3a,#3a7d6b)] hover:opacity-95 lg:w-auto"
                      onClick={() => handleConfirm(order.order_id)}
                      disabled={submitting[order.order_id]}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      {submitting[order.order_id] ? "确认中..." : "确认支付"}
                    </Button>
                  </div>
                </div>
                {actionErrors[order.order_id] && (
                  <p className="mt-3 text-sm text-red-600">{actionErrors[order.order_id]}</p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="surface-card rounded-3xl border border-[#d8e6df] p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
          最近订单（最多 120 条）
        </h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-[#d8e6df] bg-white/80">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#f4f9f6] text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">订单号</th>
                <th className="px-4 py-3 font-semibold">用户</th>
                <th className="px-4 py-3 font-semibold">状态</th>
                <th className="px-4 py-3 font-semibold">金额</th>
                <th className="px-4 py-3 font-semibold">支付方式</th>
                <th className="px-4 py-3 font-semibold">交易号</th>
                <th className="px-4 py-3 font-semibold">创建时间</th>
                <th className="px-4 py-3 font-semibold">支付时间</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-slate-500">
                    暂无订单数据
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.order_id} className="border-t border-[#e2ece8]">
                    <td className="px-4 py-3 font-mono text-xs">{order.order_id}</td>
                    <td className="px-4 py-3">{order.user_email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          order.status === "paid"
                            ? "bg-emerald-50 text-emerald-700"
                            : order.status === "pending"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {statusLabel[order.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">¥{order.amount}</td>
                    <td className="px-4 py-3">{paymentMethodLabel[order.payment_method]}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{order.transaction_id ?? "-"}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(order.created_at)}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(order.paid_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
