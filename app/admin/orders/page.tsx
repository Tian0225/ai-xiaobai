import Link from "next/link";
import { redirect } from "next/navigation";
import OrdersDashboard from "@/components/admin/orders-dashboard";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth?next=/admin/orders");
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
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-[#c8ddd6] bg-white/85 px-4 py-2 text-sm text-slate-700 transition hover:border-[var(--brand-fresh)] hover:text-[var(--brand-fresh)]"
        >
          ← 返回主站
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/membership"
            className="inline-flex items-center rounded-full border border-[#c8ddd6] bg-white/85 px-4 py-2 text-sm text-slate-700 transition hover:border-[var(--brand-fresh)] hover:text-[var(--brand-fresh)]"
          >
            会员页
          </Link>
          <Link
            href="/guide"
            className="inline-flex items-center rounded-full border border-[#c8ddd6] bg-white/85 px-4 py-2 text-sm text-slate-700 transition hover:border-[var(--brand-fresh)] hover:text-[var(--brand-fresh)]"
          >
            教程页
          </Link>
        </div>
      </div>
      <OrdersDashboard adminEmail={user.email ?? ""} />
    </main>
  );
}
