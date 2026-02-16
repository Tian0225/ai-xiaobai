"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCw, ShieldAlert, Users } from "lucide-react";

interface UserRecord {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  is_member: boolean;
  membership_expires_at: string | null;
}

interface UsersResponse {
  users: UserRecord[];
  fetchedAt: string;
}

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

export default function UsersDashboard() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [keyword, setKeyword] = useState("");

  const loadUsers = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setErrorMessage("");

    try {
      const response = await fetch("/api/admin/users", { method: "GET" });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || "读取用户失败");
      }

      const data = payload as UsersResponse;
      setUsers(data.users ?? []);
    } catch (error) {
      const message = error instanceof Error ? error.message : "读取用户失败";
      setErrorMessage(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    if (!normalizedKeyword) return users;
    return users.filter((user) => user.email.toLowerCase().includes(normalizedKeyword));
  }, [keyword, users]);

  const summary = useMemo(() => {
    return users.reduce(
      (acc, user) => {
        acc.total += 1;
        if (user.email_confirmed_at) acc.emailVerified += 1;
        if (user.is_member) acc.memberCount += 1;
        return acc;
      },
      {
        total: 0,
        emailVerified: 0,
        memberCount: 0,
      }
    );
  }, [users]);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-700 bg-slate-900/70 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Admin Console</p>
            <h1 className="mt-2 font-display text-3xl text-slate-100">用户账号管理</h1>
            <p className="mt-2 text-sm text-slate-300">这里展示已注册账号信息（邮箱、注册时间、登录状态、会员状态）。</p>
          </div>
          <Button
            variant="outline"
            className="rounded-full border-slate-600 bg-slate-900/60 text-slate-100"
            onClick={() => loadUsers(true)}
            disabled={refreshing || loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            刷新用户
          </Button>
        </div>

        <div className="mt-4 rounded-2xl border border-amber-600/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          <div className="flex items-start gap-2">
            <ShieldAlert className="mt-0.5 h-4 w-4" />
            <p>安全说明：系统不会保存或展示用户明文密码。后台仅可查看账号元信息。</p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4">
            <p className="text-xs text-slate-400">注册账号总数</p>
            <p className="mt-1 text-2xl font-display text-slate-100">{summary.total}</p>
          </div>
          <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4">
            <p className="text-xs text-slate-400">邮箱已验证</p>
            <p className="mt-1 text-2xl font-display text-emerald-300">{summary.emailVerified}</p>
          </div>
          <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4">
            <p className="text-xs text-slate-400">当前会员账号</p>
            <p className="mt-1 text-2xl font-display text-cyan-300">{summary.memberCount}</p>
          </div>
        </div>

        <div className="mt-4">
          <Input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="按邮箱搜索账号（如：@gmail.com）"
            className="max-w-sm border-slate-700 bg-slate-900/70 text-slate-100"
          />
        </div>

        {errorMessage && (
          <div className="mt-4 rounded-2xl border border-rose-700/70 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {errorMessage}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-700 bg-slate-900/70 p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-100">
          <Users className="h-5 w-5 text-cyan-300" />
          注册账号列表（{filteredUsers.length}）
        </h2>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-700 bg-slate-950/60">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-900 text-slate-300">
              <tr>
                <th className="px-4 py-3 font-semibold">邮箱</th>
                <th className="px-4 py-3 font-semibold">注册时间</th>
                <th className="px-4 py-3 font-semibold">最近登录</th>
                <th className="px-4 py-3 font-semibold">邮箱验证</th>
                <th className="px-4 py-3 font-semibold">会员状态</th>
                <th className="px-4 py-3 font-semibold">会员到期</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                    正在读取用户...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                    没有匹配的用户
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-t border-slate-800">
                    <td className="px-4 py-3 text-slate-200">{user.email || "(无邮箱)"}</td>
                    <td className="px-4 py-3 text-slate-400">{formatDate(user.created_at)}</td>
                    <td className="px-4 py-3 text-slate-400">{formatDate(user.last_sign_in_at)}</td>
                    <td className="px-4 py-3">
                      {user.email_confirmed_at ? (
                        <span className="inline-flex rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-200">
                          已验证
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-amber-500/20 px-2.5 py-1 text-xs font-semibold text-amber-200">
                          未验证
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {user.is_member ? (
                        <span className="inline-flex rounded-full bg-cyan-500/20 px-2.5 py-1 text-xs font-semibold text-cyan-200">
                          会员
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-300">
                          普通用户
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-400">{formatDate(user.membership_expires_at)}</td>
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
