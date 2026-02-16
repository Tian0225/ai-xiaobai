#!/usr/bin/env bash
set -euo pipefail

VALUE="${1:-}"
TARGET_ENV="${2:-production}"

if [[ -z "${VALUE}" ]]; then
  echo "用法: bash scripts/deploy/toggle-ui-revamp.sh <true|false> [production|preview|development]"
  exit 1
fi

NORMALIZED=$(echo "${VALUE}" | tr '[:upper:]' '[:lower:]')
if [[ "${NORMALIZED}" != "true" && "${NORMALIZED}" != "false" ]]; then
  echo "参数错误: VALUE 只能是 true 或 false"
  exit 1
fi

if [[ "${TARGET_ENV}" != "production" && "${TARGET_ENV}" != "preview" && "${TARGET_ENV}" != "development" ]]; then
  echo "参数错误: 环境只能是 production / preview / development"
  exit 1
fi

echo "即将设置 NEXT_PUBLIC_UI_REVAMP_ENABLED=${NORMALIZED} (${TARGET_ENV})"

if [[ "${DRY_RUN:-0}" == "1" ]]; then
  echo "DRY_RUN=1，仅演练，不执行 vercel env 变更。"
  exit 0
fi

echo "true" | vercel env rm NEXT_PUBLIC_UI_REVAMP_ENABLED "${TARGET_ENV}" --yes >/dev/null 2>&1 || true
echo "${NORMALIZED}" | vercel env add NEXT_PUBLIC_UI_REVAMP_ENABLED "${TARGET_ENV}"

echo "已更新环境变量。请重新部署以生效。"
