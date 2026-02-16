import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/require-admin";

const FETCH_LIMIT = 150;
const ALLOWED_STATUS = ["pending", "contacted", "accepted", "rejected"] as const;

function noStoreHeaders() {
  return { "Cache-Control": "no-store" };
}

function normalizeText(input: unknown) {
  return typeof input === "string" ? input.trim() : "";
}

export async function GET() {
  try {
    const permission = await requireAdmin();
    if (!permission.ok) {
      return NextResponse.json({ error: permission.error }, { status: permission.status, headers: noStoreHeaders() });
    }

    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from("growth_camp_applications")
      .select("id, name, phone, wechat, current_stage, goal, weekly_hours, source, status, created_at")
      .order("created_at", { ascending: false })
      .limit(FETCH_LIMIT);

    if (error) {
      console.error("读取陪跑报名列表失败:", error);
      return NextResponse.json({ error: "读取报名数据失败" }, { status: 500, headers: noStoreHeaders() });
    }

    return NextResponse.json(
      {
        applications: data ?? [],
        fetchedAt: new Date().toISOString(),
      },
      { headers: noStoreHeaders() }
    );
  } catch (error) {
    console.error("后台陪跑报名接口异常:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500, headers: noStoreHeaders() });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const permission = await requireAdmin();
    if (!permission.ok) {
      return NextResponse.json({ error: permission.error }, { status: permission.status, headers: noStoreHeaders() });
    }

    const body = await request.json();
    const id = normalizeText(body.id);
    const status = normalizeText(body.status) as (typeof ALLOWED_STATUS)[number];

    if (!id || !ALLOWED_STATUS.includes(status)) {
      return NextResponse.json({ error: "参数错误" }, { status: 400, headers: noStoreHeaders() });
    }

    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from("growth_camp_applications")
      .update({ status })
      .eq("id", id)
      .select("id, status")
      .single();

    if (error) {
      console.error("更新陪跑报名状态失败:", error);
      return NextResponse.json({ error: "更新状态失败" }, { status: 500, headers: noStoreHeaders() });
    }

    return NextResponse.json({ success: true, application: data }, { headers: noStoreHeaders() });
  } catch (error) {
    console.error("后台更新陪跑报名状态异常:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500, headers: noStoreHeaders() });
  }
}
