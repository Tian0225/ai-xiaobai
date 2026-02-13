"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, RefreshCw, ShieldCheck, ScrollText, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PaymentMethod = "wechat" | "alipay";
type OrderStatus = "pending" | "paid" | "expired" | "cancelled";
type MemberAction = "activate" | "revoke" | "restore";

type AdminAction = "member_activate" | "member_revoke" | "member_restore" | "order_verify";

interface OrderRecord {
  order_id: string;
  user_id: string;
  user_email: string;
  amount: number;
  payment_method: PaymentMethod;
  status: OrderStatus;
  transaction_id: string | null;
  created_at: string;
  paid_at: string | null;
  expires_at: string;
  is_member: boolean;
  membership_expires_at: string | null;
}

interface OrderLogRecord {
  id: string;
  actor_email: string;
  action: AdminAction;
  target_user_id: string | null;
  target_user_email: string | null;
  target_order_id: string | null;
  result: "success" | "failed";
  detail: Record<string, unknown>;
  operator_ip: string | null;
  created_at: string;
}

interface OrdersResponse {
  orders: OrderRecord[];
  fetchedAt: string;
}

interface LogsResponse {
  logs: OrderLogRecord[];
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

const actionLabel: Record<AdminAction, string> = {
  member_activate: "会员开通",
  member_revoke: "会员撤销",
  member_restore: "会员恢复",
  order_verify: "订单核销",
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

function stringifyDetail(detail: Record<string, unknown>) {
  const note = typeof detail.note === "string" ? detail.note : "";
  const reason = typeof detail.reason === "string" ? detail.reason : "";
  const summary = [note, reason].filter(Boolean).join(" | ");
  if (summary) return summary;
  return Object.keys(detail).length > 0 ? "含结构化字段" : "-";
}

export default function OrdersDashboard({ adminEmail }: OrdersDashboardProps) {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [logs, setLogs] = useState<OrderLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [actionErrors, setActionErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});
  const [memberSubmitting, setMemberSubmitting] = useState<Record<string, boolean>>({});
  const [transactionInputs, setTransactionInputs] = useState<Record<string, string>>({});
  const [operationNotes, setOperationNotes] = useState<Record<string, string>>({});
  const [checkedOrders, setCheckedOrders] = useState<Record<string, boolean>>({});

  const loadOrders = useCallback(async (showLoading = false) => {
    if (showLoading) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setErrorMessage("");

    try {
      const [ordersResponse, logsResponse] = await Promise.all([
        fetch("/api/admin/orders", { method: "GET" }),
        fetch("/api/admin/logs", { method: "GET" }),
      ]);

      const ordersPayload = await ordersResponse.json().catch(() => ({}));
      const logsPayload = await logsResponse.json().catch(() => ({}));

      if (!ordersResponse.ok) {
        throw new Error(ordersPayload.error || "获取订单失败");
      }

      if (!logsResponse.ok) {
        throw new Error(logsPayload.error || "获取操作日志失败");
      }

      const data = ordersPayload as OrdersResponse;
      const logsData = logsPayload as LogsResponse;
      setOrders(data.orders ?? []);
      setLogs(logsData.logs ?? []);
    } catch (error) {
      const message = error instanceof Error ? error.message : "获取后台数据失败";
      setErrorMessage(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
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
    if (!checkedOrders[orderId]) {
      setActionErrors((prev) => ({ ...prev, [orderId]: "请先勾选“已完成线下到账核对”" }));
      return;
    }

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

      const message = typeof payload.message === "string" ? payload.message : `订单 ${orderId} 已确认支付`;
      setSuccessMessage(message);
      setCheckedOrders((prev) => ({ ...prev, [orderId]: false }));
      setTransactionInputs((prev) => ({ ...prev, [orderId]: "" }));
      await loadOrders(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "确认支付失败";
      setActionErrors((prev) => ({ ...prev, [orderId]: message }));
    } finally {
      setSubmitting((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const handleMemberAction = async (order: OrderRecord, action: MemberAction) => {
    const actionKey = `${action}:${order.user_id}`;
    setMemberSubmitting((prev) => ({ ...prev, [actionKey]: true }));
    setActionErrors((prev) => ({ ...prev, [order.order_id]: "" }));
    setSuccessMessage("");

    const note = (operationNotes[order.order_id] ?? "").trim();

    const confirmTextMap: Record<MemberAction, string> = {
      activate: `确认手动开通 ${order.user_email} 的会员？`,
      revoke: `确认撤销 ${order.user_email} 的会员？此操作会立即失效权限。`,
      restore: `确认恢复 ${order.user_email} 的会员？`,
    };

    if (action === "revoke") {
      const confirmToken = window.prompt('请输入 REVOKE 确认撤销：', '');
      if (confirmToken !== "REVOKE") {
        setMemberSubmitting((prev) => ({ ...prev, [actionKey]: false }));
        setActionErrors((prev) => ({ ...prev, [order.order_id]: "已取消撤销操作" }));
        return;
      }
    } else if (!window.confirm(confirmTextMap[action])) {
      setMemberSubmitting((prev) => ({ ...prev, [actionKey]: false }));
      return;
    }

    try {
      const response = await fetch("/api/admin/members", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: order.user_id,
          userEmail: order.user_email,
          action,
          note,
        }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || "会员状态更新失败");
      }

      const textMap: Record<MemberAction, string> = {
        activate: "开通",
        revoke: "撤销",
        restore: "恢复",
      };

      setSuccessMessage(`已${textMap[action]} ${order.user_email} 的会员权限`);
      setOperationNotes((prev) => ({ ...prev, [order.order_id]: "" }));
      await loadOrders(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "会员状态更新失败";
      setActionErrors((prev) => ({ ...prev, [order.order_id]: message }));
    } finally {
      setMemberSubmitting((prev) => ({ ...prev, [actionKey]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-700 bg-slate-900/70 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Admin Console</p>
            <h1 className="mt-2 font-display text-3xl text-slate-100">订单人工核销后台</h1>
            <p className="mt-2 text-sm text-slate-300">当前管理员：{adminEmail}。请先核对到账，再执行核销与会员变更。</p>
          </div>
          <Button
            variant="outline"
            className="rounded-full border-slate-600 bg-slate-900/60 text-slate-100"
            onClick={() => loadOrders(true)}
            disabled={refreshing || loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            刷新后台数据
          </Button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4">
            <p className="text-xs text-slate-400">总订单</p>
            <p className="mt-1 text-2xl font-display text-slate-100">{summary.total}</p>
          </div>
          <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4">
            <p className="text-xs text-slate-400">待确认</p>
            <p className="mt-1 text-2xl font-display text-amber-300">{summary.pending}</p>
          </div>
          <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4">
            <p className="text-xs text-slate-400">已支付</p>
            <p className="mt-1 text-2xl font-display text-emerald-300">{summary.paid}</p>
          </div>
          <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4">
            <p className="text-xs text-slate-400">过期/取消</p>
            <p className="mt-1 text-2xl font-display text-slate-300">{summary.expired + summary.cancelled}</p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-amber-600/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4" />
            <p>高风险操作保护：订单核销需勾选到账确认；撤销会员需输入 REVOKE 二次确认；所有操作将写入日志。</p>
          </div>
        </div>

        {successMessage && (
          <div className="mt-4 rounded-2xl border border-emerald-700/60 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mt-4 rounded-2xl border border-rose-700/70 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {errorMessage}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-700 bg-slate-900/70 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-100">
            <Clock3 className="h-5 w-5 text-amber-300" />
            待人工确认（{pendingOrders.length}）
          </h2>
        </div>

        {loading ? (
          <p className="rounded-2xl border border-dashed border-slate-700 p-6 text-sm text-slate-400">正在加载订单...</p>
        ) : pendingOrders.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-700 p-6 text-sm text-slate-400">当前没有待确认订单。</p>
        ) : (
          <div className="space-y-3">
            {pendingOrders.map((order) => (
              <article key={order.order_id} className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4">
                <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_auto] lg:items-end">
                  <div>
                    <p className="text-xs text-slate-400">订单号</p>
                    <p className="font-mono text-sm text-slate-100">{order.order_id}</p>
                    <p className="mt-1 text-xs text-slate-400">用户：{order.user_email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">金额 / 支付方式</p>
                    <p className="text-sm font-semibold text-slate-100">
                      ¥{order.amount} · {paymentMethodLabel[order.payment_method]}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">创建：{formatDate(order.created_at)}</p>
                    <p className="mt-1 text-xs text-slate-400">过期：{formatDate(order.expires_at)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">交易号（可选）</p>
                    <Input
                      value={transactionInputs[order.order_id] ?? ""}
                      onChange={(event) =>
                        setTransactionInputs((prev) => ({
                          ...prev,
                          [order.order_id]: event.target.value,
                        }))
                      }
                      placeholder="MANUAL_TXN_001"
                      className="mt-1 border-slate-700 bg-slate-900/70 text-slate-100"
                    />
                    <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={Boolean(checkedOrders[order.order_id])}
                        onChange={(event) =>
                          setCheckedOrders((prev) => ({
                            ...prev,
                            [order.order_id]: event.target.checked,
                          }))
                        }
                      />
                      我已完成线下到账核对
                    </label>
                  </div>
                  <div>
                    <Button
                      className="w-full rounded-full bg-[linear-gradient(120deg,#1f2937,#374151)] text-slate-100 hover:bg-[linear-gradient(120deg,#374151,#4b5563)] lg:w-auto"
                      onClick={() => handleConfirm(order.order_id)}
                      disabled={submitting[order.order_id]}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      {submitting[order.order_id] ? "确认中..." : "确认支付"}
                    </Button>
                  </div>
                </div>
                {actionErrors[order.order_id] && <p className="mt-3 text-sm text-rose-300">{actionErrors[order.order_id]}</p>}
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-700 bg-slate-900/70 p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-100">
          <ShieldCheck className="h-5 w-5 text-emerald-300" />
          最近订单（最多 120 条）
        </h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-700 bg-slate-950/60">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-900 text-slate-300">
              <tr>
                <th className="px-4 py-3 font-semibold">订单号</th>
                <th className="px-4 py-3 font-semibold">用户</th>
                <th className="px-4 py-3 font-semibold">状态</th>
                <th className="px-4 py-3 font-semibold">金额</th>
                <th className="px-4 py-3 font-semibold">支付方式</th>
                <th className="px-4 py-3 font-semibold">交易号</th>
                <th className="px-4 py-3 font-semibold">会员状态</th>
                <th className="px-4 py-3 font-semibold">会员备注</th>
                <th className="px-4 py-3 font-semibold">创建时间</th>
                <th className="px-4 py-3 font-semibold">支付时间</th>
                <th className="px-4 py-3 font-semibold">操作</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-6 text-center text-slate-400">
                    暂无订单数据
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.order_id} className="border-t border-slate-800">
                    <td className="px-4 py-3 font-mono text-xs text-slate-200">{order.order_id}</td>
                    <td className="px-4 py-3 text-slate-200">{order.user_email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          order.status === "paid"
                            ? "bg-emerald-500/20 text-emerald-200"
                            : order.status === "pending"
                              ? "bg-amber-500/20 text-amber-200"
                              : "bg-slate-700 text-slate-300"
                        }`}
                      >
                        {statusLabel[order.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-200">¥{order.amount}</td>
                    <td className="px-4 py-3 text-slate-200">{paymentMethodLabel[order.payment_method]}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{order.transaction_id ?? "-"}</td>
                    <td className="px-4 py-3">
                      {order.is_member ? (
                        <span className="inline-flex rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-200">已开通</span>
                      ) : (
                        <span className="inline-flex rounded-full bg-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-300">未开通</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        value={operationNotes[order.order_id] ?? ""}
                        onChange={(event) =>
                          setOperationNotes((prev) => ({
                            ...prev,
                            [order.order_id]: event.target.value,
                          }))
                        }
                        placeholder="操作备注（可选）"
                        className="h-8 border-slate-700 bg-slate-900/70 text-xs text-slate-200"
                      />
                    </td>
                    <td className="px-4 py-3 text-slate-400">{formatDate(order.created_at)}</td>
                    <td className="px-4 py-3 text-slate-400">{formatDate(order.paid_at)}</td>
                    <td className="px-4 py-3">
                      {order.status === "paid" ? (
                        <div className="flex flex-wrap gap-2">
                          {!order.is_member && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-emerald-500/50 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20"
                                disabled={memberSubmitting[`activate:${order.user_id}`]}
                                onClick={() => handleMemberAction(order, "activate")}
                              >
                                {memberSubmitting[`activate:${order.user_id}`] ? "开通中..." : "开通"}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-sky-500/50 bg-sky-500/10 text-sky-200 hover:bg-sky-500/20"
                                disabled={memberSubmitting[`restore:${order.user_id}`]}
                                onClick={() => handleMemberAction(order, "restore")}
                              >
                                {memberSubmitting[`restore:${order.user_id}`] ? "恢复中..." : "恢复"}
                              </Button>
                            </>
                          )}
                          {order.is_member && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-rose-500/50 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20"
                              disabled={memberSubmitting[`revoke:${order.user_id}`]}
                              onClick={() => handleMemberAction(order, "revoke")}
                            >
                              {memberSubmitting[`revoke:${order.user_id}`] ? "撤销中..." : "撤销"}
                            </Button>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-700 bg-slate-900/70 p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-100">
          <ScrollText className="h-5 w-5 text-cyan-300" />
          操作日志（最近 80 条）
        </h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-700 bg-slate-950/60">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-900 text-slate-300">
              <tr>
                <th className="px-4 py-3 font-semibold">时间</th>
                <th className="px-4 py-3 font-semibold">操作者</th>
                <th className="px-4 py-3 font-semibold">动作</th>
                <th className="px-4 py-3 font-semibold">目标用户</th>
                <th className="px-4 py-3 font-semibold">目标订单</th>
                <th className="px-4 py-3 font-semibold">结果</th>
                <th className="px-4 py-3 font-semibold">IP</th>
                <th className="px-4 py-3 font-semibold">细节</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-slate-400">
                    暂无操作日志
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="border-t border-slate-800">
                    <td className="px-4 py-3 text-slate-400">{formatDate(log.created_at)}</td>
                    <td className="px-4 py-3 text-slate-200">{log.actor_email}</td>
                    <td className="px-4 py-3 text-slate-200">{actionLabel[log.action]}</td>
                    <td className="px-4 py-3 text-slate-200">{log.target_user_email ?? "-"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{log.target_order_id ?? "-"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          log.result === "success" ? "bg-emerald-500/20 text-emerald-200" : "bg-rose-500/20 text-rose-200"
                        }`}
                      >
                        {log.result === "success" ? "成功" : "失败"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{log.operator_ip ?? "-"}</td>
                    <td className="px-4 py-3 text-slate-400">{stringifyDetail(log.detail)}</td>
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
