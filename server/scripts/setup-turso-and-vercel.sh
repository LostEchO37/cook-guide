#!/usr/bin/env bash
# One-shot: Turso DB + print Vercel env (free tier). Run after: turso auth login
set -euo pipefail

DB_NAME="${TURSO_DB_NAME:-ember-cook-guide}"
REGION="${TURSO_REGION:-sin}"
VERCEL_PROJECT="${VERCEL_PROJECT:-cook-guide-analytics}"

if ! command -v turso >/dev/null 2>&1; then
  echo "Installing Turso CLI..."
  curl -sSfL https://get.tur.so/install.sh | bash
  export PATH="$HOME/.turso/bin:$PATH"
fi

if ! turso auth whoami >/dev/null 2>&1; then
  echo "Not logged in. Run: turso auth login"
  echo "Then re-run: bash server/scripts/setup-turso-and-vercel.sh"
  exit 1
fi

if ! turso db show "$DB_NAME" >/dev/null 2>&1; then
  echo "Creating database $DB_NAME (region $REGION)..."
  turso db create "$DB_NAME" --region "$REGION"
else
  echo "Database $DB_NAME already exists."
fi

URL="$(turso db show "$DB_NAME" --url)"
TOKEN="$(turso db tokens create "$DB_NAME")"

echo ""
echo "========== Add these in Vercel → Project → Settings → Environment Variables =========="
echo "TURSO_DATABASE_URL=$URL"
echo "TURSO_AUTH_TOKEN=$TOKEN"
echo "===================================================================================="
echo ""

if command -v vercel >/dev/null 2>&1; then
  read -r -p "Push to Vercel project '$VERCEL_PROJECT' now? [y/N] " ans
  if [[ "${ans,,}" == "y" ]]; then
    cd "$(dirname "$0")/.."
    printf '%s' "$URL" | vercel env add TURSO_DATABASE_URL production
    printf '%s' "$TOKEN" | vercel env add TURSO_AUTH_TOKEN production
    vercel --prod
    echo "Done. Check: curl -sS https://${VERCEL_PROJECT}.vercel.app/health"
  fi
else
  echo "Optional: npm i -g vercel && vercel login, then re-run to auto-push env vars."
fi
