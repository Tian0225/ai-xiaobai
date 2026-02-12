#!/usr/bin/env bash
set -euo pipefail

PROJECT_NAME="${PROJECT_NAME:-}"

if [[ -z "${PROJECT_NAME}" ]] && [[ -f ".vercel/project.json" ]]; then
  PROJECT_NAME=$(node -e "const fs=require('fs');const p=JSON.parse(fs.readFileSync('.vercel/project.json','utf8'));process.stdout.write(p.projectName||'');")
fi

PROJECT_NAME="${PROJECT_NAME:-ai-xiaobai}"

echo "项目: ${PROJECT_NAME}"
echo "获取 Production Ready 部署列表..."

RAW_JSON=$(vercel ls "${PROJECT_NAME}" --environment production --status READY --format json)

PREV_URL=$(RAW_JSON="${RAW_JSON}" node <<'NODE'
const raw = process.env.RAW_JSON || '';
const begin = raw.indexOf('{');
if (begin < 0) {
  process.exit(2);
}
const parsed = JSON.parse(raw.slice(begin));
const list = Array.isArray(parsed.deployments) ? parsed.deployments : [];
list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
if (list.length < 2) {
  process.exit(3);
}
process.stdout.write(`https://${list[1].url}`);
NODE
)

if [[ -z "${PREV_URL}" ]]; then
  echo "未找到可回滚的上一版生产部署（至少需要两次 READY 生产发布）。"
  exit 1
fi

echo "即将回滚到: ${PREV_URL}"

if [[ "${DRY_RUN:-0}" == "1" ]]; then
  echo "DRY_RUN=1，仅演练，不执行 rollback。"
  exit 0
fi

vercel rollback "${PREV_URL}" --yes

echo "回滚命令已执行。建议立即验证:"
echo "1) 首页可访问"
echo "2) /auth、/membership、/api/orders/reconcile 返回状态符合预期"
echo "3) Vercel Logs 无新增 5xx 峰值"
