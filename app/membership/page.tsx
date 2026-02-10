import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PaymentForm from '@/components/payment/payment-form'

export default async function MembershipPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth?next=/membership')
  }

  // 检查是否已是会员
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_member, membership_expires_at')
    .eq('id', user.id)
    .single()

  const isMember = profile?.is_member && new Date(profile.membership_expires_at) > new Date()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">年度会员</h1>
          <p className="text-xl text-gray-600">解锁所有进阶教程和专属权益</p>
        </div>

        {isMember ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-4 text-6xl">🎉</div>
            <h2 className="text-2xl font-bold mb-2">您已是会员</h2>
            <p className="text-gray-600 mb-4">
              会员有效期至：{new Date(profile.membership_expires_at).toLocaleDateString()}
            </p>
            <a href="/guide" className="text-blue-600 hover:underline">
              前往教程区学习 →
            </a>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {/* 左侧：会员权益 */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6">会员权益</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <div>
                    <h3 className="font-semibold">所有进阶教程</h3>
                    <p className="text-sm text-gray-600">解锁全部付费内容，持续更新</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <div>
                    <h3 className="font-semibold">每月最新教程</h3>
                    <p className="text-sm text-gray-600">Agent Teams、Clawdbot、最新 MCP 等热门话题</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <div>
                    <h3 className="font-semibold">会员专属社群</h3>
                    <p className="text-sm text-gray-600">加入微信群，与同行交流</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <div>
                    <h3 className="font-semibold">问题优先解答</h3>
                    <p className="text-sm text-gray-600">遇到问题，优先得到回复</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <div>
                    <h3 className="font-semibold">新课程优先体验</h3>
                    <p className="text-sm text-gray-600">第一时间体验新推出的实战课程</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-3xl font-bold text-blue-600">¥499</div>
                <div className="text-sm text-gray-600">一年 / 365天</div>
                <div className="text-xs text-gray-500 mt-2">平均每天不到 1.4 元</div>
              </div>
            </div>

            {/* 右侧：支付表单 */}
            <PaymentForm userEmail={user.email || ''} />
          </div>
        )}
      </div>
    </div>
  )
}
