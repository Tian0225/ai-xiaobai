import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const wechat = typeof body.wechat === "string" ? body.wechat.trim() : "";
    const currentStage = typeof body.currentStage === "string" ? body.currentStage.trim() : "";
    const goal = typeof body.goal === "string" ? body.goal.trim() : "";
    const weeklyHours = typeof body.weeklyHours === "string" ? body.weeklyHours.trim() : "";

    if (!name || !phone || !wechat || !currentStage || !goal || !weeklyHours) {
      return NextResponse.json({ error: "请填写所有必填字段" }, { status: 400 });
    }

    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json({ error: "请输入有效的手机号" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { error } = await supabase.from("growth_camp_applications").insert({
      name,
      phone,
      wechat,
      current_stage: currentStage,
      goal,
      weekly_hours: weeklyHours,
      status: "pending",
      source: "growth-camp-apply-page",
    });

    if (error) {
      console.error("保存陪跑报名失败:", error);
      return NextResponse.json({ error: "报名通道暂不可用，请稍后重试" }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        message: "提交成功，我们将在 24 小时内联系你",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing growth camp apply request:", error);
    return NextResponse.json({ error: "服务器错误，请稍后重试" }, { status: 500 });
  }
}
