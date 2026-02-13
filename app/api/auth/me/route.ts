import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/auth/admin";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json(
        { user: null },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("token_balance")
      .eq("id", user.id)
      .maybeSingle();

    const safeTokenBalance = Number((profile as { token_balance?: number | null } | null)?.token_balance ?? 0);

    return NextResponse.json(
      {
        user: {
          email: user.email,
          isAdmin: isAdminEmail(user.email),
          tokenBalance: Number.isFinite(safeTokenBalance) ? safeTokenBalance : 0,
        },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("读取当前登录用户失败:", error);
    return NextResponse.json(
      { user: null },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
