import { siteProfile } from "@/lib/site-profile";
import Link from "next/link";

const contactItems = [
  {
    title: "客服邮箱",
    value: siteProfile.supportEmail,
    desc: "用于订单问题、开通异常、退款咨询",
  },
  {
    title: "工作时间",
    value: siteProfile.serviceHours,
    desc: "非工作时间收到的消息会在下一工作日处理",
  },
  {
    title: "合作与咨询",
    value: siteProfile.businessEmail,
    desc: "企业咨询、培训合作、技术支持",
  },
];

export default function ContactPage() {
  return (
    <main className="uipro-contact-canvas min-h-screen pb-16 pt-28">
      <section className="layout-grid max-w-5xl">
        <div className="uipro-contact-surface mb-8 rounded-3xl p-6 sm:p-8">
          <p className="uipro-contact-pill inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]">
            Support Center
          </p>
          <h1 className="mt-4 text-3xl font-display text-[var(--uipro-contact-text)] sm:text-4xl">联系我们</h1>
          <p className="mt-3 max-w-2xl text-slate-700">
            订单、会员、咨询问题都可在这里快速处理。工作时间内优先回复，异常情况会提供明确下一步。
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/membership" className="uipro-contact-cta inline-flex rounded-full px-4 py-2 text-sm font-semibold">
              会员问题入口
            </Link>
            <Link
              href="/legal/refund"
              className="inline-flex rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              查看退款规则
            </Link>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {contactItems.map((item) => (
            <article key={item.title} className="uipro-contact-surface rounded-2xl p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{item.title}</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{item.value}</p>
              <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="uipro-contact-surface rounded-2xl p-5">
            <p className="text-sm font-semibold text-[var(--uipro-contact-text)]">处理时效说明</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li>1. 订单/支付问题：优先处理，建议附订单号与截图。</li>
              <li>2. 会员开通异常：优先核对账户邮箱与订单状态。</li>
              <li>3. 企业咨询：在 1 个工作日内安排初步沟通。</li>
            </ul>
          </article>

          <article className="uipro-contact-surface rounded-2xl p-5 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">主体信息</p>
            <p className="mt-2">主体名称：{siteProfile.legalEntityName}</p>
            <p className="mt-1">站点域名：{siteProfile.siteDomain}</p>
          </article>
        </div>
      </section>
    </main>
  );
}
