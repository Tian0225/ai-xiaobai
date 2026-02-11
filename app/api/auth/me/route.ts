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

    return NextResponse.json(
      {
        user: {
          email: user.email,
          isAdmin: isAdminEmail(user.email),
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
