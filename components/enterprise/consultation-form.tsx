"use client";

import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ConsultationForm() {
  const [formData, setFormData] = useState({
    company: "",
    name: "",
    phone: "",
    email: "",
    employees: "",
    needs: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/enterprise/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "提交失败，请稍后重试");
      }

      setIsSubmitted(true);
      setFormData({
        company: "",
        name: "",
        phone: "",
        email: "",
        employees: "",
        needs: "",
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "提交失败，请稍后重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (isSubmitted) {
    return (
      <section id="consultation-form" className="py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="surface-card rounded-3xl border border-[#dbe7ff] p-8 text-center sm:p-10">
            <div className="mx-auto mb-6 inline-flex rounded-full bg-[#e8f1ff] p-4">
              <CheckCircle2 className="h-12 w-12 text-[#1d4ed8]" />
            </div>
            <h3 className="font-display text-3xl text-[var(--brand-ink)]">预约成功</h3>
            <p className="mt-4 text-slate-600">
              我们已收到您的咨询申请，将在 24 小时内与您联系。
            </p>
            <Button
              variant="outline"
              className="mt-8 rounded-full border-[#bfdbfe] bg-white/90 text-[#1d4ed8]"
              onClick={() => setIsSubmitted(false)}
            >
              继续预约
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="consultation-form" className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="surface-card rounded-3xl border border-[#dbe7ff] p-7 sm:p-10">
          <div className="mb-8 text-center">
            <h2 className="font-display text-3xl tracking-tight text-[var(--brand-ink)] sm:text-4xl">预约免费诊断</h2>
            <p className="mt-3 text-lg text-slate-600">填写关键信息，我们会给出可执行的初步路线建议。</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="company" className="mb-2 block text-sm font-medium text-slate-700">
                  公司名称 <span className="text-red-500">*</span>
                </label>
                <Input
                  id="company"
                  name="company"
                  type="text"
                  required
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="例：XX科技有限公司"
                  className="bg-white/90"
                />
              </div>

              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700">
                  联系人 <span className="text-red-500">*</span>
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="例：张三"
                  className="bg-white/90"
                />
              </div>

              <div>
                <label htmlFor="phone" className="mb-2 block text-sm font-medium text-slate-700">
                  联系电话 <span className="text-red-500">*</span>
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="例：13800138000"
                  className="bg-white/90"
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                  邮箱地址
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="例：example@company.com"
                  className="bg-white/90"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="employees" className="mb-2 block text-sm font-medium text-slate-700">
                  公司规模
                </label>
                <Input
                  id="employees"
                  name="employees"
                  type="text"
                  value={formData.employees}
                  onChange={handleChange}
                  placeholder="例：50-200人"
                  className="bg-white/90"
                />
              </div>
            </div>

            <div>
              <label htmlFor="needs" className="mb-2 block text-sm font-medium text-slate-700">
                您的需求 <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="needs"
                name="needs"
                required
                value={formData.needs}
                onChange={handleChange}
                rows={5}
                placeholder="请描述您的业务目标、当前流程和希望优先解决的问题"
                className="bg-white/90"
              />
            </div>

            {errorMessage && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </p>
            )}

            <div className="rounded-xl border border-[#bfdbfe] bg-[#eff6ff] p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-800">我们承诺</p>
              <p className="mt-1">信息仅用于咨询沟通，24 小时内响应，免费诊断无隐藏费用。</p>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full rounded-full bg-[linear-gradient(120deg,#1d4ed8,#0ea5e9)] hover:opacity-95"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "提交中..."
              ) : (
                <>
                  提交预约
                  <Send className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
