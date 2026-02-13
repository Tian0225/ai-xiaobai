import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const QUERY_LIMIT = 20;

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "未登录" }, { status: 401, headers: { "Cache-Control": "no-store" } });
    }

    const { data, error } = await supabase
      .from("token_ledger")
      .select("id, order_id, biz_type, change_amount, balance_after, note, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(QUERY_LIMIT);

    if (error) {
      console.error("查询代币流水失败:", error);
      return NextResponse.json({ error: "查询代币流水失败" }, { status: 500, headers: { "Cache-Control": "no-store" } });
    }

    return NextResponse.json(
      {
        records: data ?? [],
        fetchedAt: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("代币流水接口异常:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
