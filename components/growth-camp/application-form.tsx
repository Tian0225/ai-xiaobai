"use client";

import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ApplicationFormData {
  name: string;
  phone: string;
  wechat: string;
  currentStage: string;
  goal: string;
  weeklyHours: string;
}

const initialFormData: ApplicationFormData = {
  name: "",
  phone: "",
  wechat: "",
  currentStage: "",
  goal: "",
  weeklyHours: "",
};

export default function ApplicationForm() {
  const [formData, setFormData] = useState<ApplicationFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/growth-camp/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "提交失败，请稍后重试");
      }

      setIsSubmitted(true);
      setFormData(initialFormData);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "提交失败，请稍后重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (isSubmitted) {
    return (
      <div className="surface-card rounded-3xl border border-[#d8e6df] p-8 text-center sm:p-10">
        <div className="mx-auto mb-6 inline-flex rounded-full bg-[#e3f0eb] p-4">
          <CheckCircle2 className="h-12 w-12 text-[var(--brand-fresh)]" />
        </div>
        <h2 className="font-display text-3xl text-[var(--brand-ink)]">报名意向提交成功</h2>
        <p className="mt-4 text-slate-600">
          我们已收到你的信息，将在 24 小时内联系你确认是否进入当期陪跑评估。
        </p>
        <Button
          variant="outline"
          className="mt-8 rounded-full border-[#b9d1c9] bg-white/90"
          onClick={() => setIsSubmitted(false)}
        >
          再提交一份
        </Button>
      </div>
    );
  }

  return (
    <div className="surface-card rounded-3xl border border-[#d8e6df] p-6 sm:p-8">
      <div className="mb-7">
        <h2 className="font-display text-3xl tracking-tight text-[var(--brand-ink)] sm:text-4xl">提交陪跑报名意向</h2>
        <p className="mt-3 text-slate-600">填写以下信息后，我们会先做匹配评估，再安排后续沟通。</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700">
              姓名 <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="例：小白"
              className="bg-white/90"
            />
          </div>

          <div>
            <label htmlFor="phone" className="mb-2 block text-sm font-medium text-slate-700">
              手机号 <span className="text-red-500">*</span>
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

          <div className="sm:col-span-2">
            <label htmlFor="wechat" className="mb-2 block text-sm font-medium text-slate-700">
              微信号 <span className="text-red-500">*</span>
            </label>
            <Input
              id="wechat"
              name="wechat"
              type="text"
              required
              value={formData.wechat}
              onChange={handleChange}
              placeholder="用于后续沟通"
              className="bg-white/90"
            />
          </div>
        </div>

        <div>
          <label htmlFor="currentStage" className="mb-2 block text-sm font-medium text-slate-700">
            当前阶段 <span className="text-red-500">*</span>
          </label>
          <Textarea
            id="currentStage"
            name="currentStage"
            required
            rows={3}
            value={formData.currentStage}
            onChange={handleChange}
            placeholder="你目前的 AI 能力、已有项目经验和当前变现状态"
            className="bg-white/90"
          />
        </div>

        <div>
          <label htmlFor="goal" className="mb-2 block text-sm font-medium text-slate-700">
            目标与预期 <span className="text-red-500">*</span>
          </label>
          <Textarea
            id="goal"
            name="goal"
            required
            rows={3}
            value={formData.goal}
            onChange={handleChange}
            placeholder="希望在 6 周内达到什么结果，比如首单、稳定接单、提升成交率等"
            className="bg-white/90"
          />
        </div>

        <div>
          <label htmlFor="weeklyHours" className="mb-2 block text-sm font-medium text-slate-700">
            每周可投入时间 <span className="text-red-500">*</span>
          </label>
          <Input
            id="weeklyHours"
            name="weeklyHours"
            type="text"
            required
            value={formData.weeklyHours}
            onChange={handleChange}
            placeholder="例：每周 8-10 小时"
            className="bg-white/90"
          />
        </div>

        {errorMessage ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>
        ) : null}

        <div className="rounded-xl border border-[#c8ddd6] bg-[#f8fbf9] p-4 text-sm text-slate-600">
          <p className="font-semibold text-slate-800">提交后会发生什么</p>
          <p className="mt-1">我们会先进行适配评估，再联系你确认是否进入当期陪跑，避免无效报名。</p>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full rounded-full bg-[linear-gradient(120deg,#0d3b3a,#3a7d6b)] hover:opacity-95"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            "提交中..."
          ) : (
            <>
              提交报名意向
              <Send className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
