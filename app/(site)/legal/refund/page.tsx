import { siteProfile } from "@/lib/site-profile";
import Link from "next/link";

export default function RefundPage() {
  return (
    <main className="uipro-legal-canvas min-h-screen pb-16 pt-28">
      <section className="layout-grid max-w-4xl">
        <div className="uipro-legal-surface rounded-3xl p-6 sm:p-8">
          <p className="uipro-legal-pill inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]">
            Policy
          </p>
          <h1 className="mt-4 text-3xl font-display text-[var(--uipro-legal-text)]">退款说明</h1>
          <p className="mt-3 text-sm text-slate-500">更新时间：2026-02-12</p>

          <div className="uipro-legal-surface mt-6 rounded-2xl p-4 text-sm text-slate-700">
            建议提交申请时附上订单号、支付截图和购买邮箱，可显著缩短处理时间。
          </div>

          <div className="mt-8 space-y-6 text-sm leading-7 text-slate-700">
            <section>
              <h2 className="text-base font-semibold text-slate-900">1. 年度会员服务</h2>
              <p>
                若购买后未实际使用会员权益（如未访问会员内容），可在 7 天内提交退款申请。超过 7 天或已实际使用部分权益，将按已交付服务情况处理。
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">2. 训练营与咨询服务</h2>
              <p>
                训练营与咨询属于定制化服务。若尚未开始排期，可申请全额退款；若已进入交付阶段，将按合同约定与实际交付进度结算。
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">3. 不支持退款场景</h2>
              <ul className="list-disc pl-5">
                <li>已完整交付且已使用核心权益的服务</li>
                <li>因用户提供信息错误导致的交付问题</li>
                <li>违反服务条款导致的账户限制或终止</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">4. 申请方式</h2>
              <p>
                请发送邮件至 {siteProfile.supportEmail}，附订单号、购买邮箱与退款原因。我们将在 3 个工作日内完成初审并回复结果。
              </p>
            </section>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            <Link
              href="/contact"
              className="inline-flex rounded-full border border-[color-mix(in_oklab,var(--uipro-legal-secondary)_30%,white)] bg-white px-4 py-2 text-sm font-semibold text-[var(--uipro-legal-primary)]"
            >
              联系客服提交申请
            </Link>
            <Link
              href="/legal/terms"
              className="inline-flex rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
            >
              查看服务条款
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
