#!/usr/bin/env bash
# docs-guard (sc-frontend) — rede de segurança determinística do CI.
# Falha o PR se o código mudou sem a documentação correspondente no mesmo diff.
# Uso: scripts/docs-guard.sh [base-ref]   (default: origin/development)
set -euo pipefail

BASE="${1:-origin/development}"
CHANGED=$(git diff --name-only "$BASE"...HEAD)
fail=0

has() { echo "$CHANGED" | grep -qE "$1"; }
err() { echo "❌ docs-guard: $1"; fail=1; }

# 1. Qualquer mudança em src/ ou app/ exige entrada no CHANGELOG
if has '^(src|app)/' && ! has '^CHANGELOG\.md$'; then
  err "código mudou sem entrada no CHANGELOG.md ([Unreleased])."
fi

# 2. Mudança de dependências exige CHANGELOG (seção Dependencies)
if has '^package\.json$' && ! has '^CHANGELOG\.md$'; then
  err "package.json mudou sem entrada no CHANGELOG.md (Dependencies)."
fi

if [ "$fail" -eq 1 ]; then
  echo ""
  echo "Atualize a documentação no mesmo branch e faça novo push."
  exit 1
fi
echo "✅ docs-guard: documentação consistente com o diff."
