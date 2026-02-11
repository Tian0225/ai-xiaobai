"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send, CheckCircle2 } from "lucide-react";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/enterprise/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setFormData({
          company: "",
          name: "",
          phone: "",
          email: "",
          employees: "",
          needs: "",
        });
      } else {
        alert("提交失败，请稍后重试");
      }
    } catch {
      alert("提交失败，请稍后重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (isSubmitted) {
    return (
      <section id="consultation-form" className="py-20 bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-green-100 p-4">
                <CheckCircle2 className="h-16 w-16 text-green-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              预约成功！
            </h3>
            <p className="text-gray-600 mb-8">
              我们已收到您的咨询申请，将在 24 小时内与您联系。
              <br />
              感谢您的信任！
            </p>
            <Button
              variant="outline"
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
    <section id="consultation-form" className="py-20 bg-white">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            预约免费诊断
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            填写表单，我们将在 24 小时内联系您
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                您的姓名 <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="例：张三"
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                邮箱地址
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="例：example@company.com"
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="employees" className="block text-sm font-medium text-gray-700 mb-2">
                公司规模
              </label>
              <Input
                id="employees"
                name="employees"
                type="text"
                value={formData.employees}
                onChange={handleChange}
                placeholder="例：50-200人"
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label htmlFor="needs" className="block text-sm font-medium text-gray-700 mb-2">
              您的需求 <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="needs"
              name="needs"
              required
              value={formData.needs}
              onChange={handleChange}
              rows={5}
              placeholder="请简单描述您的需求，例如：&#10;· 希望用 AI 提升客服效率&#10;· 需要自动化处理大量文档&#10;· 想了解 AI 如何帮助我们的业务"
              className="w-full"
            />
          </div>

          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-blue-900">
              <strong>我们承诺：</strong>
              <br />
              ✓ 您的信息将严格保密，仅用于沟通联系
              <br />
              ✓ 24 小时内响应，1-3 天内完成初步诊断
              <br />
              ✓ 免费诊断，无任何隐性费用
            </p>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>提交中...</>
            ) : (
              <>
                提交预约
                <Send className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </div>
    </section>
  );
}
