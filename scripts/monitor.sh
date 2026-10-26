#!/usr/bin/env bash
# One-shot status snapshot: container state, CPU/memory, health, host resources, recent errors.
# Usage: ./scripts/monitor.sh [compose-file]   (default docker-compose.yml; use docker-compose.prod.yml on the server)
set -u
F="${1:-docker-compose.yml}"
URL="${HEALTH_URL:-http://localhost:${HTTP_PORT:-8080}/health}"
echo "=== Containers ($F) ===";            docker compose -f "$F" ps
echo; echo "=== CPU / memory (docker stats) ==="
docker stats --no-stream --format 'table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}'
echo; echo "=== Health: $URL ===";           curl -sS -m 5 -w '\nHTTP %{http_code}\n' "$URL" || echo "UNREACHABLE"
echo; echo "=== Host ===";                   uptime; free -m; df -h / | tail -1
echo; echo "=== Last 5 non-2xx/3xx Nginx requests ==="
docker compose -f "$F" logs --no-log-prefix --tail=500 web 2>/dev/null | grep -E '" (4|5)[0-9]{2} ' | tail -5 || true
echo; echo "=== Last 10 backend log lines ==="
docker compose -f "$F" logs --no-log-prefix --tail=10 backend
