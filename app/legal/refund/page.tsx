import Navbar from "@/components/marketing/navbar";
import Footer from "@/components/marketing/footer";
import { siteProfile } from "@/lib/site-profile";

export default function RefundPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 pt-28 pb-16">
        <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-[#d8e6df] bg-white p-6 sm:p-8">
            <h1 className="text-3xl font-display text-[var(--brand-ink)]">退款说明</h1>
            <p className="mt-3 text-sm text-slate-500">更新时间：2026-02-12</p>

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
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
