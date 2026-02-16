import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import UsersDashboard from "@/components/admin/users-dashboard";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "【后台】用户账号管理 - AI-xiaobai",
  description: "AI-xiaobai 管理后台：查看注册账号信息",
};

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth?next=/admin/users");
  }

  if (!isAdminEmail(user.email)) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-16">
        <div className="surface-card w-full rounded-3xl border border-[#d8e6df] p-8 text-center">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Access Denied</p>
          <h1 className="mt-2 font-display text-3xl text-[var(--brand-ink)]">你没有后台权限</h1>
          <p className="mt-3 text-sm text-slate-600">
            当前登录账号：{user.email ?? "未知邮箱"}。请把该邮箱加入 `ADMIN_EMAILS` 后重试。
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-full bg-[linear-gradient(120deg,#0d3b3a,#3a7d6b)] px-5 py-2 text-sm font-semibold text-white"
          >
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main>
      <div className="mb-5 rounded-2xl border border-slate-700 bg-slate-900/70 px-5 py-4 text-slate-100 shadow-[0_22px_52px_-34px_rgba(0,0,0,0.85)]">
        <p className="text-xs uppercase tracking-[0.24em] text-amber-300">ADMIN BACKSTAGE</p>
        <p className="mt-1 text-lg font-semibold">管理后台 · 用户账号与注册信息（P1）</p>
      </div>
      <div className="mb-6 flex flex-wrap items-center justify-end gap-3">
        <div className="flex items-center gap-2">
          <Link
            href="/admin/orders"
            className="inline-flex items-center rounded-full border border-slate-600 bg-slate-900/60 px-4 py-2 text-sm text-slate-200 transition hover:border-amber-300 hover:text-amber-200"
          >
            订单后台
          </Link>
          <Link
            href="/membership"
            className="inline-flex items-center rounded-full border border-slate-600 bg-slate-900/60 px-4 py-2 text-sm text-slate-200 transition hover:border-amber-300 hover:text-amber-200"
          >
            会员页
          </Link>
        </div>
      </div>
      <UsersDashboard />
    </main>
  );
}
