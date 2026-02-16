import { siteProfile } from "@/lib/site-profile";

export default function TermsPage() {
  return (
      <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 pt-28 pb-16">
        <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-[#d8e6df] bg-white p-6 sm:p-8">
            <h1 className="text-3xl font-display text-[var(--brand-ink)]">服务条款</h1>
            <p className="mt-3 text-sm text-slate-500">更新时间：2026-02-12</p>

            <div className="mt-8 space-y-6 text-sm leading-7 text-slate-700">
              <section>
                <h2 className="text-base font-semibold text-slate-900">1. 服务范围</h2>
                <p>
                  本站提供 AI 学习相关的数字内容与咨询服务，包括教程内容、会员权益、企业咨询与培训支持。
                </p>
              </section>

              <section>
                <h2 className="text-base font-semibold text-slate-900">2. 账户与使用规范</h2>
                <p>
                  用户需使用真实、有效的信息注册与购买服务。严禁利用本站服务从事违法违规活动，或传播侵犯他人权益的内容。
                </p>
              </section>

              <section>
                <h2 className="text-base font-semibold text-slate-900">3. 付费与交付</h2>
                <p>
                  用户完成支付后，系统将按对应服务规则自动开通权益。若因系统异常导致未开通，可通过客服渠道申请人工处理。
                </p>
              </section>

              <section>
                <h2 className="text-base font-semibold text-slate-900">4. 知识产权</h2>
                <p>
                  本站发布的教程、模板与文档内容受知识产权保护。未经许可，禁止复制、转售或用于未授权商业分发。
                </p>
              </section>

              <section>
                <h2 className="text-base font-semibold text-slate-900">5. 免责声明</h2>
                <p>
                  本站提供的内容仅用于学习与业务实践参考，不构成法律、财税或投资建议。用户应结合自身情况独立判断并承担决策责任。
                </p>
              </section>

              <section>
                <h2 className="text-base font-semibold text-slate-900">6. 联系方式</h2>
                <p>
                  客服邮箱：{siteProfile.supportEmail}。我们会在{siteProfile.serviceHours}内优先回复。
                </p>
              </section>
            </div>
          </div>
        </section>
      </main>
  );
}
