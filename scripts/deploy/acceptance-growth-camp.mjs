#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";

const baseUrl = process.env.E2E_BASE_URL || "http://127.0.0.1:3000";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const shouldCleanup = process.env.E2E_CLEANUP !== "false";

function assertEnv() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "缺少环境变量：NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY"
    );
  }
}

function buildPayload() {
  const suffix = `${Date.now()}`;
  const tail = suffix.slice(-8);

  return {
    name: `E2E-${tail}`,
    phone: `139${tail}`,
    wechat: `e2e_${tail}`,
    currentStage: "已完成基础教程，尚未形成稳定接单链路",
    goal: "6 周内拿到首单并形成可复用交付流程",
    weeklyHours: "每周 8-10 小时",
  };
}

async function submitApplication(payload) {
  const response = await fetch(`${baseUrl}/api/growth-camp/apply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`报名提交失败: ${data.error || response.status}`);
  }

  return data;
}

async function wait(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function findInsertedRow(adminClient, phone) {
  const { data, error } = await adminClient
    .from("growth_camp_applications")
    .select("id, name, phone, wechat, status, source, created_at")
    .eq("phone", phone)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`数据库查询失败: ${error.message}`);
  }

  if (!data) {
    throw new Error("数据库未找到新提交记录");
  }

  return data;
}

async function updateStatus(adminClient, id, status) {
  const { error } = await adminClient
    .from("growth_camp_applications")
    .update({ status })
    .eq("id", id);

  if (error) {
    throw new Error(`更新状态 ${status} 失败: ${error.message}`);
  }
}

async function cleanup(adminClient, id) {
  const { error } = await adminClient
    .from("growth_camp_applications")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`清理测试数据失败: ${error.message}`);
  }
}

async function main() {
  assertEnv();
  const payload = buildPayload();

  console.log(`[E2E] baseUrl = ${baseUrl}`);
  console.log("[E2E] Step 1/4 提交报名...");
  await submitApplication(payload);

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  await wait(300);
  console.log("[E2E] Step 2/4 校验入库...");
  const row = await findInsertedRow(adminClient, payload.phone);

  if (row.status !== "pending") {
    throw new Error(`新线索初始状态异常: ${row.status}`);
  }

  console.log(`[E2E] 已入库 id=${row.id}, status=${row.status}, source=${row.source ?? "-"}`);

  console.log("[E2E] Step 3/4 执行状态流转 pending -> contacted -> accepted...");
  await updateStatus(adminClient, row.id, "contacted");
  await updateStatus(adminClient, row.id, "accepted");

  const finalRow = await findInsertedRow(adminClient, payload.phone);
  if (finalRow.status !== "accepted") {
    throw new Error(`状态流转校验失败，当前状态: ${finalRow.status}`);
  }

  console.log("[E2E] Step 4/4 验证通过");

  if (shouldCleanup) {
    await cleanup(adminClient, row.id);
    console.log("[E2E] 已清理测试数据");
  } else {
    console.log("[E2E] 未清理测试数据（E2E_CLEANUP=false）");
  }

  console.log("[E2E] Growth-camp 报名链路验收通过");
}

main().catch((error) => {
  console.error("[E2E] 验收失败:", error instanceof Error ? error.message : error);
  process.exit(1);
});
