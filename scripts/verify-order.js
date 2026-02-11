#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);
  const env = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx <= 0) continue;

    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }

  return env;
}

function getLocalEnv() {
  const cwd = process.cwd();
  const local = parseEnvFile(path.join(cwd, ".env.local"));
  const example = parseEnvFile(path.join(cwd, ".env.example"));
  return { ...example, ...local, ...process.env };
}

async function main() {
  const [, , orderIdArg, transactionIdArg, baseUrlArg] = process.argv;
  const env = getLocalEnv();

  const orderId = (orderIdArg || "").trim();
  const transactionId = (transactionIdArg || `MANUAL_${Date.now()}`).trim();
  const baseUrl = (baseUrlArg || env.VERIFY_API_BASE_URL || env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
  const token = env.PAYMENT_VERIFY_TOKEN;

  if (!orderId) {
    console.error("用法: npm run order:verify -- <ORDER_ID> [TRANSACTION_ID] [BASE_URL]");
    process.exit(1);
  }

  if (!token) {
    console.error("缺少 PAYMENT_VERIFY_TOKEN。请在 .env.local 配置后重试。");
    process.exit(1);
  }

  const target = `${baseUrl}/api/orders/verify`;

  const response = await fetch(target, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-payment-verify-token": token,
    },
    body: JSON.stringify({
      orderId,
      transactionId,
    }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("确认失败:", response.status, payload);
    process.exit(1);
  }

  console.log("确认成功:", payload);
}

main().catch((error) => {
  console.error("执行失败:", error);
  process.exit(1);
});
