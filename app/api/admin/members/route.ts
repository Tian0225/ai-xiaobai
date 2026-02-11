import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/auth/admin";

type MemberAction = "revoke" | "grant";

function noStoreHeaders() {
  return { "Cache-Control": "no-store" };
}

async function verifyAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false as const, status: 401, error: "未登录" };
  }

  if (!isAdminEmail(user.email)) {
    return { ok: false as const, status: 403, error: "无权限操作会员" };
  }

  return { ok: true as const };
}

export async function PATCH(request: NextRequest) {
  const permission = await verifyAdmin();
  if (!permission.ok) {
    return NextResponse.json(
      { error: permission.error },
      { status: permission.status, headers: noStoreHeaders() }
    );
  }

  try {
    const body = await request.json();
    const userId = typeof body.userId === "string" ? body.userId.trim() : "";
    const userEmail = typeof body.userEmail === "string" ? body.userEmail.trim() : "";
    const action = body.action as MemberAction;

    if (!userId || !userEmail || !["revoke", "grant"].includes(action)) {
      return NextResponse.json(
        { error: "参数错误" },
        { status: 400, headers: noStoreHeaders() }
      );
    }

    const adminClient = createAdminClient();
    const nowIso = new Date().toISOString();

    if (action === "revoke") {
      const { data, error } = await adminClient
        .from("profiles")
        .upsert({
          id: userId,
          email: userEmail,
          is_member: false,
          membership_expires_at: null,
          updated_at: nowIso,
        })
        .select("id, is_member, membership_expires_at")
        .single();

      if (error) {
        console.error("撤销会员失败:", error);
        return NextResponse.json(
          { error: "撤销会员失败" },
          { status: 500, headers: noStoreHeaders() }
        );
      }

      return NextResponse.json(
        { success: true, action, member: data },
        { headers: noStoreHeaders() }
      );
    }

    const membershipExpiresAt = new Date();
    membershipExpiresAt.setFullYear(membershipExpiresAt.getFullYear() + 1);

    const { data, error } = await adminClient
      .from("profiles")
      .upsert({
        id: userId,
        email: userEmail,
        is_member: true,
        membership_expires_at: membershipExpiresAt.toISOString(),
        updated_at: nowIso,
      })
      .select("id, is_member, membership_expires_at")
      .single();

    if (error) {
      console.error("恢复会员失败:", error);
      return NextResponse.json(
        { error: "恢复会员失败" },
        { status: 500, headers: noStoreHeaders() }
      );
    }

    return NextResponse.json(
      { success: true, action, member: data },
      { headers: noStoreHeaders() }
    );
  } catch (error) {
    console.error("会员管理接口异常:", error);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500, headers: noStoreHeaders() }
    );
  }
}
