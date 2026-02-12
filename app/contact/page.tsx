import Navbar from "@/components/marketing/navbar";
import Footer from "@/components/marketing/footer";
import { siteProfile } from "@/lib/site-profile";

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
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 pt-28 pb-16">
        <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 rounded-3xl border border-[#d8e6df] bg-white p-6 sm:p-8">
            <h1 className="text-3xl font-display text-[var(--brand-ink)]">联系我们</h1>
            <p className="mt-3 text-slate-600">如有订单、会员、咨询相关问题，可通过以下方式联系，我们会尽快处理。</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {contactItems.map((item) => (
              <article key={item.title} className="rounded-2xl border border-[#d8e6df] bg-white p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{item.title}</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{item.value}</p>
                <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-[#d8e6df] bg-[#f7fbf9] p-5 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">主体信息</p>
            <p className="mt-2">主体名称：{siteProfile.legalEntityName}</p>
            <p className="mt-1">站点域名：{siteProfile.siteDomain}</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
