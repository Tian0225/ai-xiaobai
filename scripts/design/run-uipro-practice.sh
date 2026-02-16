#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="${1:-/Users/jitian/Documents/ai-xiaobai}"
SKILL_ROOT="${2:-/Users/jitian/.codex/skills/ui-ux-pro-max}"
OUT_DIR="${PROJECT_ROOT}/design-system/practice"

mkdir -p "${OUT_DIR}"

python3 "${SKILL_ROOT}/scripts/search.py" \
  "membership subscription learning community payment" \
  --domain style -n 5 > "${OUT_DIR}/membership-style.txt"

python3 "${SKILL_ROOT}/scripts/search.py" \
  "membership subscription learning community payment" \
  --domain color -n 5 > "${OUT_DIR}/membership-color.txt"

python3 "${SKILL_ROOT}/scripts/search.py" \
  "membership subscription learning community payment" \
  --domain ux -n 12 > "${OUT_DIR}/membership-ux.txt"

python3 "${SKILL_ROOT}/scripts/search.py" \
  "AI services ecommerce product card pricing" \
  --domain style -n 5 > "${OUT_DIR}/shop-style.txt"

python3 "${SKILL_ROOT}/scripts/search.py" \
  "AI services ecommerce product card pricing" \
  --domain color -n 5 > "${OUT_DIR}/shop-color.txt"

python3 "${SKILL_ROOT}/scripts/search.py" \
  "AI services ecommerce product card pricing" \
  --domain ux -n 12 > "${OUT_DIR}/shop-ux.txt"

python3 "${SKILL_ROOT}/scripts/search.py" \
  "AI tutorial learning center content library" \
  --domain style -n 5 > "${OUT_DIR}/guide-style.txt"

python3 "${SKILL_ROOT}/scripts/search.py" \
  "AI tutorial learning center content library" \
  --domain color -n 5 > "${OUT_DIR}/guide-color.txt"

python3 "${SKILL_ROOT}/scripts/search.py" \
  "AI tutorial learning center content library" \
  --domain ux -n 12 > "${OUT_DIR}/guide-ux.txt"

python3 "${SKILL_ROOT}/scripts/search.py" \
  "enterprise ai consulting b2b services" \
  --domain style -n 5 > "${OUT_DIR}/enterprise-style.txt"

python3 "${SKILL_ROOT}/scripts/search.py" \
  "enterprise ai consulting b2b services" \
  --domain color -n 5 > "${OUT_DIR}/enterprise-color.txt"

python3 "${SKILL_ROOT}/scripts/search.py" \
  "enterprise ai consulting b2b services" \
  --domain ux -n 12 > "${OUT_DIR}/enterprise-ux.txt"

python3 "${SKILL_ROOT}/scripts/search.py" \
  "contact support help center faq" \
  --domain style -n 5 > "${OUT_DIR}/contact-style.txt"

python3 "${SKILL_ROOT}/scripts/search.py" \
  "contact support help center faq" \
  --domain color -n 5 > "${OUT_DIR}/contact-color.txt"

python3 "${SKILL_ROOT}/scripts/search.py" \
  "contact support help center faq" \
  --domain ux -n 12 > "${OUT_DIR}/contact-ux.txt"

python3 "${SKILL_ROOT}/scripts/search.py" \
  "legal terms privacy refund policy" \
  --domain style -n 5 > "${OUT_DIR}/legal-style.txt"

python3 "${SKILL_ROOT}/scripts/search.py" \
  "legal terms privacy refund policy" \
  --domain color -n 5 > "${OUT_DIR}/legal-color.txt"

python3 "${SKILL_ROOT}/scripts/search.py" \
  "legal terms privacy refund policy" \
  --domain ux -n 12 > "${OUT_DIR}/legal-ux.txt"

echo "UI Pro Max practice logs updated in: ${OUT_DIR}"
