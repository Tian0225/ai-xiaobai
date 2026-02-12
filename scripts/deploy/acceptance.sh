#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-3100}"
BASE_URL="${BASE_URL:-http://127.0.0.1:${PORT}}"
START_LOG="${START_LOG:-/tmp/ai-xiaobai-start.log}"

APP_PID=""

cleanup() {
  if [[ -n "${APP_PID}" ]] && kill -0 "${APP_PID}" >/dev/null 2>&1; then
    kill "${APP_PID}" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

assert_one_of_status() {
  local name="$1"
  local status="$2"
  shift 2
  local ok=0
  for expected in "$@"; do
    if [[ "${status}" == "${expected}" ]]; then
      ok=1
      break
    fi
  done
  if [[ "${ok}" -ne 1 ]]; then
    echo "[FAIL] ${name}: got ${status}, expected one of: $*"
    exit 1
  fi
  echo "[PASS] ${name}: ${status}"
}

echo "==> [1/4] 启动前构建检查"
npm run build >/dev/null

echo "==> [2/4] 启动应用 (PORT=${PORT})"
npm run start -- -p "${PORT}" >"${START_LOG}" 2>&1 &
APP_PID=$!

for i in {1..40}; do
  if curl -fsS "${BASE_URL}" >/dev/null 2>&1; then
    break
  fi
  sleep 1
  if [[ "$i" == "40" ]]; then
    echo "应用启动超时，请检查日志: ${START_LOG}"
    exit 1
  fi
done

echo "==> [3/4] 关键路径冒烟"
status_home=$(curl -sS -o /dev/null -w "%{http_code}" "${BASE_URL}/")
assert_one_of_status "首页可访问" "${status_home}" 200

status_auth_callback=$(curl -sS -o /dev/null -w "%{http_code}" "${BASE_URL}/auth/callback")
assert_one_of_status "认证回调兜底重定向" "${status_auth_callback}" 307 302

status_membership=$(curl -sS -o /dev/null -w "%{http_code}" "${BASE_URL}/membership")
assert_one_of_status "会员页鉴权" "${status_membership}" 307 302 200

echo "==> [4/4] 异常路径校验"
status_alipay=$(curl -sS -o /tmp/ai-xiaobai-alipay-notify.json -w "%{http_code}" -X POST "${BASE_URL}/api/payments/alipay/notify")
assert_one_of_status "支付宝回调未接入状态" "${status_alipay}" 501
if ! grep -q 'ALIPAY_NOT_IMPLEMENTED' /tmp/ai-xiaobai-alipay-notify.json; then
  echo "[FAIL] 支付宝回调返回体缺少 ALIPAY_NOT_IMPLEMENTED"
  exit 1
fi

auto_body='{"company":"A","name":"B","phone":"123","needs":"test"}'
status_consultation=$(curl -sS -o /tmp/ai-xiaobai-consultation.json -w "%{http_code}" -X POST "${BASE_URL}/api/enterprise/consultation" -H 'Content-Type: application/json' -d "${auto_body}")
assert_one_of_status "企业咨询参数校验" "${status_consultation}" 400

status_reconcile=$(curl -sS -o /tmp/ai-xiaobai-reconcile.json -w "%{http_code}" "${BASE_URL}/api/orders/reconcile")
assert_one_of_status "对账接口鉴权" "${status_reconcile}" 401 503

echo ""
echo "全部自动验收通过。"
echo ""
echo "建议继续执行手工验收（支付闭环）："
echo "1. 登录测试账号后，在 /membership 创建微信订单，验证二维码展示与轮询状态。"
echo "2. 在后台 /admin/orders 人工确认支付，确认订单 pending->paid 与会员到期时间更新。"
echo "3. 对同一订单重复触发 /api/orders/verify，确认返回 idempotent=true。"
