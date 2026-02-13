import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { writeTokenLedger } from "@/lib/token-ledger";

interface ConsumeBody {
  amount?: number;
  requestId?: string;
  note?: string;
}

function noStoreHeaders() {
  return { "Cache-Control": "no-store" };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as ConsumeBody;
    const amount = Number(body.amount ?? 0);
    const requestId = typeof body.requestId === "string" ? body.requestId.trim() : "";
    const note = typeof body.note === "string" ? body.note.trim() : "";

    if (!Number.isInteger(amount) || amount <= 0) {
      return NextResponse.json({ error: "扣减数量必须是正整数" }, { status: 400, headers: noStoreHeaders() });
    }
    if (!requestId) {
      return NextResponse.json({ error: "缺少 requestId" }, { status: 400, headers: noStoreHeaders() });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json({ error: "未登录" }, { status: 401, headers: noStoreHeaders() });
    }

    const { data: existedLedger } = await supabase
      .from("token_ledger")
      .select("id, balance_after, change_amount")
      .eq("user_id", user.id)
      .eq("biz_type", "token_consume")
      .eq("order_id", requestId)
      .maybeSingle();

    if (existedLedger) {
      return NextResponse.json(
        {
          success: true,
          idempotent: true,
          balanceAfter: existedLedger.balance_after,
          consumed: Math.abs(Number(existedLedger.change_amount ?? amount)),
        },
        { headers: noStoreHeaders() }
      );
    }

    const { data: profile, error: profileQueryError } = await supabase
      .from("profiles")
      .select("token_balance")
      .eq("id", user.id)
      .maybeSingle();

    if (profileQueryError) {
      console.error("查询代币余额失败:", profileQueryError);
      return NextResponse.json({ error: "查询余额失败" }, { status: 500, headers: noStoreHeaders() });
    }

    const currentBalanceRaw = Number((profile as { token_balance?: number | null } | null)?.token_balance ?? 0);
    const currentBalance = Number.isFinite(currentBalanceRaw) ? currentBalanceRaw : 0;
    if (currentBalance < amount) {
      return NextResponse.json(
        { error: "代币余额不足", balance: currentBalance, need: amount },
        { status: 409, headers: noStoreHeaders() }
      );
    }

    const balanceAfter = currentBalance - amount;
    const nowIso = new Date().toISOString();

    const { data: updatedRows, error: updateError } = await supabase
      .from("profiles")
      .update({
        token_balance: balanceAfter,
        updated_at: nowIso,
      })
      .eq("id", user.id)
      .eq("token_balance", currentBalance)
      .select("id")
      .limit(1);

    if (updateError) {
      console.error("扣减代币失败:", updateError);
      return NextResponse.json({ error: "扣减代币失败" }, { status: 500, headers: noStoreHeaders() });
    }

    if (!updatedRows || updatedRows.length === 0) {
      return NextResponse.json(
        { error: "代币余额变化，请重试", retryable: true },
        { status: 409, headers: noStoreHeaders() }
      );
    }

    const ledgerWrite = await writeTokenLedger(supabase, {
      userId: user.id,
      userEmail: user.email,
      orderId: requestId,
      bizType: "token_consume",
      changeAmount: -amount,
      balanceAfter,
      note: note || "站内功能消耗代币",
    });

    if (!ledgerWrite.ok) {
      await supabase
        .from("profiles")
        .update({
          token_balance: currentBalance,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .eq("token_balance", balanceAfter);

      return NextResponse.json({ error: `写入代币流水失败: ${ledgerWrite.error}` }, { status: 500, headers: noStoreHeaders() });
    }

    return NextResponse.json(
      {
        success: true,
        idempotent: false,
        consumed: amount,
        balanceAfter,
      },
      { headers: noStoreHeaders() }
    );
  } catch (error) {
    console.error("代币消耗接口异常:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500, headers: noStoreHeaders() });
  }
}
