"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { LoaderCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type ApplicationStatus = "pending" | "contacted" | "accepted" | "rejected";

interface GrowthCampApplication {
  id: string;
  name: string;
  phone: string;
  wechat: string;
  current_stage: string;
  goal: string;
  weekly_hours: string;
  source: string | null;
  status: ApplicationStatus;
  created_at: string;
}

interface ApplicationsResponse {
  applications: GrowthCampApplication[];
  fetchedAt: string;
}

const statusOptions: ApplicationStatus[] = ["pending", "contacted", "accepted", "rejected"];

const statusLabel: Record<ApplicationStatus, string> = {
  pending: "待跟进",
  contacted: "已联系",
  accepted: "已录取",
  rejected: "暂不匹配",
};

const statusStyle: Record<ApplicationStatus, string> = {
  pending: "border-amber-400/50 bg-amber-500/10 text-amber-200",
  contacted: "border-sky-400/50 bg-sky-500/10 text-sky-200",
  accepted: "border-emerald-400/50 bg-emerald-500/10 text-emerald-200",
  rejected: "border-rose-400/50 bg-rose-500/10 text-rose-200",
};

function formatDate(iso: string) {
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

export default function GrowthCampApplicationsDashboard() {
  const [applications, setApplications] = useState<GrowthCampApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [updatingMap, setUpdatingMap] = useState<Record<string, boolean>>({});

  const loadData = useCallback(async (manual = false) => {
    if (manual) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setErrorMessage("");

    try {
      const response = await fetch("/api/admin/growth-camp-applications", {
        method: "GET",
        cache: "no-store",
      });
      const payload = (await response.json().catch(() => ({}))) as Partial<ApplicationsResponse> & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "读取报名列表失败");
      }

      setApplications(payload.applications ?? []);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "读取报名列表失败");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const summary = useMemo(() => {
    return applications.reduce(
      (acc, item) => {
        acc.total += 1;
        acc[item.status] += 1;
        return acc;
      },
      { total: 0, pending: 0, contacted: 0, accepted: 0, rejected: 0 }
    );
  }, [applications]);

  const handleStatusChange = async (id: string, nextStatus: ApplicationStatus) => {
    setUpdatingMap((prev) => ({ ...prev, [id]: true }));
    setErrorMessage("");

    try {
      const response = await fetch("/api/admin/growth-camp-applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: nextStatus }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || "更新状态失败");
      }

      setApplications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: nextStatus } : item))
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "更新状态失败");
    } finally {
      setUpdatingMap((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-700 bg-slate-900/70 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-amber-300">Growth Camp Leads</p>
            <h1 className="mt-1 font-display text-3xl text-slate-100">AI 变现陪跑报名线索</h1>
            <p className="mt-2 text-sm text-slate-300">统一查看报名意向并更新跟进状态。</p>
          </div>
          <Button
            variant="outline"
            className="rounded-full border-slate-600 bg-slate-900/60 text-slate-100"
            onClick={() => loadData(true)}
            disabled={refreshing || loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            刷新数据
          </Button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4">
            <p className="text-xs text-slate-400">总线索</p>
            <p className="mt-1 text-2xl font-display text-slate-100">{summary.total}</p>
          </div>
          <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4">
            <p className="text-xs text-slate-400">待跟进</p>
            <p className="mt-1 text-2xl font-display text-amber-300">{summary.pending}</p>
          </div>
          <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4">
            <p className="text-xs text-slate-400">已联系</p>
            <p className="mt-1 text-2xl font-display text-sky-300">{summary.contacted}</p>
          </div>
          <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4">
            <p className="text-xs text-slate-400">已录取</p>
            <p className="mt-1 text-2xl font-display text-emerald-300">{summary.accepted}</p>
          </div>
          <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4">
            <p className="text-xs text-slate-400">暂不匹配</p>
            <p className="mt-1 text-2xl font-display text-rose-300">{summary.rejected}</p>
          </div>
        </div>

        {errorMessage ? (
          <p className="mt-4 rounded-2xl border border-rose-500/60 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {errorMessage}
          </p>
        ) : null}
      </section>

      {loading ? (
        <div className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          正在读取报名数据...
        </div>
      ) : null}

      {!loading && applications.length === 0 ? (
        <div className="rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-6 text-sm text-slate-300">
          暂无报名数据。
        </div>
      ) : null}

      <section className="space-y-4">
        {applications.map((item) => (
          <article key={item.id} className="rounded-3xl border border-slate-700 bg-slate-900/70 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm text-slate-400">{formatDate(item.created_at)}</p>
                <h2 className="mt-1 text-lg font-semibold text-slate-100">
                  {item.name} · {item.phone}
                </h2>
                <p className="mt-1 text-sm text-slate-300">微信：{item.wechat}</p>
                <p className="mt-1 text-xs text-slate-500">来源：{item.source ?? "unknown"}</p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusStyle[item.status]}`}>
                {statusLabel[item.status]}
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-slate-500">当前阶段</p>
                <p className="mt-2 text-sm text-slate-200 whitespace-pre-wrap">{item.current_stage}</p>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-slate-500">目标与预期</p>
                <p className="mt-2 text-sm text-slate-200 whitespace-pre-wrap">{item.goal}</p>
              </div>
            </div>

            <div className="mt-3 rounded-2xl border border-slate-700 bg-slate-950/60 p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-500">每周可投入时间</p>
              <p className="mt-2 text-sm text-slate-200">{item.weekly_hours}</p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {statusOptions.map((status) => (
                <Button
                  key={`${item.id}:${status}`}
                  size="sm"
                  variant="outline"
                  disabled={item.status === status || updatingMap[item.id]}
                  className="rounded-full border-slate-600 bg-slate-900/70 text-slate-100 hover:bg-slate-800"
                  onClick={() => handleStatusChange(item.id, status)}
                >
                  {updatingMap[item.id] && item.status !== status ? (
                    <LoaderCircle className="mr-1 h-3.5 w-3.5 animate-spin" />
                  ) : null}
                  标记为{statusLabel[status]}
                </Button>
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
