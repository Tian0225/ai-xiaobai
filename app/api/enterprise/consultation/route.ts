import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const company = typeof body.company === "string" ? body.company.trim() : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const employees = typeof body.employees === "string" ? body.employees.trim() : "";
    const needs = typeof body.needs === "string" ? body.needs.trim() : "";

    // 验证必填字段
    if (!company || !name || !phone || !needs) {
      return NextResponse.json(
        { error: "请填写所有必填字段" },
        { status: 400 }
      );
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: "请输入有效的手机号" },
        { status: 400 }
      );
    }

    // 验证邮箱格式（如果提供）
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: "请输入有效的邮箱地址" },
          { status: 400 }
        );
      }
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("enterprise_consultations")
      .insert({
        company,
        name,
        phone,
        email: email || null,
        employees: employees || null,
        needs,
        status: "pending",
      })
      .select("id, company, name, phone, email, employees, needs, status, created_at")
      .single();

    if (error) {
      console.error("保存企业咨询失败:", error);
      return NextResponse.json(
        { error: "咨询通道暂不可用，请稍后重试" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "预约成功，我们将在 24 小时内与您联系",
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing consultation request:", error);
    return NextResponse.json(
      { error: "服务器错误，请稍后重试" },
      { status: 500 }
    );
  }
}
