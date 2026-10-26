#!/usr/bin/env bash
# Usage: ./scripts/simulate-502.sh break | diagnose | fix
set -u
BASE="docker compose -f docker-compose.yml"
URL="http://localhost:${HTTP_PORT:-8080}"
case "${1:-}" in
  break)
    $BASE -f scripts/broken-port.override.yml up -d backend
    sleep 15; echo "--- GET /health:"; curl -s -o /dev/null -w 'HTTP %{http_code}\n' "$URL/health" ;;
  diagnose)
    echo "### 1. What does the user see?";                 curl -s -i "$URL/api/categories" | head -5
    echo; echo "### 2. Container status (note STATUS/health)"; $BASE ps
    echo; echo "### 3. Nginx error log";                    $BASE logs --no-log-prefix --tail=20 web | grep -E 'error|" 50[0-9] ' | tail -10
    echo; echo "### 4. Backend log (which port is it on?)"; $BASE logs --no-log-prefix --tail=10 backend
    echo; echo "### 5. Which port is the app really listening on?"
    $BASE exec backend node -e "console.log('PORT env =', process.env.PORT)"
    echo; echo "### 6. Reach the backend directly on the internal network"
    $BASE exec backend node -e "for (const p of [5000,5001]) fetch('http://127.0.0.1:'+p+'/health').then(r=>console.log(p,'->',r.status)).catch(()=>console.log(p,'-> connection refused'))" ;;
  fix)
    $BASE up -d backend   # recreates the backend WITHOUT the override, so PORT=5000 again
    sleep 15; curl -s -o /dev/null -w 'GET /health -> HTTP %{http_code}\n' "$URL/health" ;;
  *) echo "usage: $0 break|diagnose|fix"; exit 1 ;;
esac
