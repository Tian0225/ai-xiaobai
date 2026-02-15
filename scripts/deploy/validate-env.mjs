#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const cwd = process.cwd();
const ENV_EXAMPLE_PATH = path.join(cwd, '.env.example');
const ENV_LOCAL_PATH = path.join(cwd, '.env.local');

const REQUIRED_VARS = [
  'NEXT_PUBLIC_SITE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ADMIN_EMAILS',
  'NEXT_PUBLIC_MEMBERSHIP_PRICE',
  'PAYMENT_VERIFY_TOKEN',
  'ORDER_RECONCILE_TOKEN',
  'CRON_SECRET',
  'WECHAT_PAY_MCH_ID',
  'WECHAT_PAY_APP_ID',
  'WECHAT_PAY_MCH_SERIAL_NO',
  'WECHAT_PAY_MCH_PRIVATE_KEY',
  'WECHAT_PAY_API_V3_KEY',
  'WECHAT_PAY_NOTIFY_URL',
  'WECHAT_PAY_API_BASE',
  'WECHAT_PAY_ORDER_DESC',
  'WECHAT_BILL_API_URL',
  'WECHAT_BILL_API_TOKEN',
  'ALIPAY_BILL_API_URL',
  'ALIPAY_BILL_API_TOKEN',
  'PAYMENT_POLL_WINDOW_MINUTES',
  'PAYMENT_ADAPTER_TIMEOUT_MS',
];

const OPTIONAL_VARS = [
  'ANTHROPIC_API_KEY',
  'ANTHROPIC_BASE_URL',
  'NEXT_PUBLIC_MEMBERSHIP_PURCHASE_URL',
  'XPAY_NOTIFY_TOKEN',
  'ALIPAY_APP_ID',
  'ALIPAY_PRIVATE_KEY',
  'ALIPAY_PUBLIC_KEY',
  'NEXT_PUBLIC_SITE_NAME',
  'NEXT_PUBLIC_WECHAT_QR_CODE',
  'NEXT_PUBLIC_ALIPAY_QR_CODE',
];

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  const result = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }

  return result;
}

function looksPlaceholder(value) {
  if (!value) return true;
  const v = value.toLowerCase();
  return [
    'your-',
    'your_',
    'example.com',
    'example',
    'changeme',
    'replace_me',
    'xxxxx',
    'todo',
  ].some((token) => v.includes(token));
}

function printSection(title) {
  console.log(`\n=== ${title} ===`);
}

function checkLocalEnv() {
  const example = parseEnvFile(ENV_EXAMPLE_PATH);
  const local = parseEnvFile(ENV_LOCAL_PATH);
  const merged = { ...example, ...local, ...process.env };

  const missing = [];
  const placeholders = [];

  for (const key of REQUIRED_VARS) {
    const value = merged[key];
    if (!value || !String(value).trim()) {
      missing.push(key);
      continue;
    }
    if (looksPlaceholder(String(value))) {
      placeholders.push(key);
    }
  }

  printSection('本地环境变量校验 (.env.local)');
  console.log(`必填变量总数: ${REQUIRED_VARS.length}`);
  console.log(`缺失: ${missing.length}`);
  console.log(`疑似占位值: ${placeholders.length}`);

  if (missing.length) {
    console.log('\n缺失变量:');
    for (const key of missing) console.log(`- ${key}`);
  }
  if (placeholders.length) {
    console.log('\n疑似占位值变量:');
    for (const key of placeholders) console.log(`- ${key}`);
  }

  return { merged, missing, placeholders };
}

function extractJson(raw) {
  const begin = raw.indexOf('{');
  if (begin === -1) {
    throw new Error('未找到 JSON 输出');
  }
  return JSON.parse(raw.slice(begin));
}

function checkVercelEnv() {
  printSection('Vercel 环境变量校验');

  try {
    const raw = execSync('vercel env ls --format json', {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const parsed = extractJson(raw);
    const envs = Array.isArray(parsed.envs) ? parsed.envs : [];

    const keyToTargets = new Map();
    for (const item of envs) {
      const key = item?.key || item?.name;
      if (!key) continue;
      const targetsRaw = item?.target;
      const targets = Array.isArray(targetsRaw)
        ? targetsRaw
        : targetsRaw
          ? [targetsRaw]
          : [];
      const existing = keyToTargets.get(key) || new Set();
      for (const t of targets) existing.add(String(t));
      keyToTargets.set(key, existing);
    }

    const missing = [];
    const missingProduction = [];
    for (const key of REQUIRED_VARS) {
      if (!keyToTargets.has(key)) {
        missing.push(key);
        continue;
      }
      const targets = keyToTargets.get(key);
      if (targets && !targets.has('production')) {
        missingProduction.push(key);
      }
    }

    console.log(`Vercel 已配置变量总数: ${keyToTargets.size}`);
    console.log(`必填变量缺失: ${missing.length}`);
    console.log(`缺少 production 作用域: ${missingProduction.length}`);

    if (missing.length) {
      console.log('\nVercel 缺失变量:');
      for (const key of missing) console.log(`- ${key}`);
    }
    if (missingProduction.length) {
      console.log('\nVercel 未绑定 production 的变量:');
      for (const key of missingProduction) console.log(`- ${key}`);
    }

    return { available: true, missing, missingProduction };
  } catch (error) {
    console.log('跳过 Vercel 校验: vercel CLI 未登录/不可用，或当前目录未关联项目。');
    console.log(`原因: ${error instanceof Error ? error.message : String(error)}`);
    return { available: false, missing: [], missingProduction: [] };
  }
}

async function checkSupabase(localEnv) {
  printSection('Supabase 校验');

  const url = localEnv.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = localEnv.SUPABASE_SERVICE_ROLE_KEY;
  const siteUrl = localEnv.NEXT_PUBLIC_SITE_URL;

  if (!url || !serviceRole) {
    console.log('跳过 Supabase 在线校验: 缺少 NEXT_PUBLIC_SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY。');
    return { available: false, tableErrors: ['missing_credentials'] };
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(url, serviceRole, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const tableErrors = [];
    const tables = ['profiles', 'orders', 'enterprise_consultations'];

    for (const table of tables) {
      const { error } = await supabase.from(table).select('*', { count: 'exact', head: true }).limit(1);
      if (error) {
        tableErrors.push(`${table}: ${error.message}`);
      }
    }

    const expectedAuthCallbacks = [
      'http://localhost:3000/auth/callback',
      siteUrl ? `${siteUrl.replace(/\/$/, '')}/auth/callback` : '(未配置 NEXT_PUBLIC_SITE_URL)',
    ];

    console.log(`目标项目: ${url}`);
    console.log(`表结构检查异常: ${tableErrors.length}`);
    if (tableErrors.length) {
      console.log('\n表结构问题:');
      for (const msg of tableErrors) console.log(`- ${msg}`);
    }

    console.log('\n请在 Supabase Dashboard 手工确认 Auth 回调白名单包含:');
    for (const callback of expectedAuthCallbacks) console.log(`- ${callback}`);

    return { available: true, tableErrors };
  } catch (error) {
    console.log(`Supabase 在线校验失败: ${error instanceof Error ? error.message : String(error)}`);
    return { available: false, tableErrors: ['client_init_failed'] };
  }
}

async function main() {
  const local = checkLocalEnv();
  const vercel = checkVercelEnv();
  const supabase = await checkSupabase(local.merged);

  printSection('总结');
  const blockers = [
    local.missing.length > 0,
    local.placeholders.length > 0,
    vercel.available && (vercel.missing.length > 0 || vercel.missingProduction.length > 0),
    supabase.available && supabase.tableErrors.length > 0,
  ].some(Boolean);

  if (blockers) {
    console.log('结果: 未通过（存在阻断项）');
    process.exitCode = 1;
  } else {
    console.log('结果: 通过（可进入上线前验收）');
  }

  if (OPTIONAL_VARS.length) {
    console.log('\n可选变量（按需配置）:');
    for (const key of OPTIONAL_VARS) console.log(`- ${key}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
