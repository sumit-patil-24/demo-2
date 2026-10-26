# Troubleshooting report – 502 Bad Gateway after a deployment

> **How to use this file:** run the drill yourself (`./scripts/simulate-502.sh break`, then `diagnose`, then `fix`) on your deployed server or local stack, and paste your **real** output into the "Evidence" blocks and your screenshots. The "expected" notes below describe what you should see; do not submit them as captured output.

- **Author / date:** ______  **Environment:** EC2 `<ip>` / local Compose  **Deployed version:** commit `<sha>`

## 1. Incident summary
After a deployment the site returned **502 Bad Gateway** for every `/api` and `/health` request. The React page itself still loaded because Nginx serves it from static files, which makes the outage look partial.

## 2. Timeline and investigation (in the order I checked things)
A 502 means Nginx is up but could not get a valid answer from its upstream. So: confirm the layer, then look at the upstream.

| # | Question | Command | What I saw (paste) |
|---|---|---|---|
| 1 | Is Nginx answering, and what does the user see? | `curl -i http://<host>/health` | _HTTP/1.1 502 Bad Gateway from nginx_ |
| 2 | Are all containers running? Healthy? | `docker compose ps` | _expected: `web`, `db` up; `backend` shows **healthy**_ |
| 3 | What does Nginx say about the upstream? | `docker compose logs --tail=30 web` | _expected: `connect() failed (111: Connection refused) while connecting to upstream ... "http://<backend-ip>:5000/health"`_ |
| 4 | Is the app crashing or logging errors? | `docker compose logs --tail=30 backend` | _expected: `LocalBizHub API listening on :5001`_ |
| 5 | Which port is the app really on? | `docker compose exec backend node -e "console.log(process.env.PORT)"` | _expected: `5001`_ |
| 6 | Does the app answer directly? | `simulate-502.sh diagnose`, step 6 | _expected: 5000 → connection refused, 5001 → 200_ |

Why step 2 is misleading: the container healthcheck reads `$PORT`, so it tests port 5001 and passes. "Healthy" only proves the app answers on *its own* port, not that Nginx can reach it.

## 3. Root cause
The deployed backend was started with `PORT=5001` (a changed environment value), while Nginx's upstream is hard-coded to `backend:5000`. Nginx's connection to port 5000 was refused, producing 502. The application, database and image were fine; the two components disagreed about the port.

Other common causes I ruled out with the same commands:

| Cause | How it shows up |
|---|---|
| Backend crash-looping (missing `JWT_SECRET`, DB unreachable) | `docker compose ps` shows `Restarting`; backend log has the exception |
| Backend stopped / not started | `ps` shows `Exited`; Nginx log: `host not found in upstream` or connection refused |
| Nginx pointing at a stale container IP | Nginx log shows an old upstream IP; fixed here by runtime DNS re-resolve (`resolver 127.0.0.11`) |
| Upstream timeout (slow startup / migration) | Nginx log: `upstream timed out (110)`; this would be 504 for read timeouts |
| Security group / firewall | affects the browser → host hop, so you would see a timeout, not a 502 |

## 4. Fix
Restore the port the Nginx upstream expects and recreate the container:
```bash
docker compose up -d backend          # without the override, PORT=5000 again
curl -i http://<host>/health          # HTTP 200 {"status":"ok","db":"up"}
```
Evidence after the fix (paste): ______

## 5. Prevention (what I changed)
1. `PORT` is **fixed to 5000** in `docker-compose.yml` / `docker-compose.prod.yml` (no longer read from `.env`), so a stray variable cannot move the app.
2. The pipeline's **smoke test goes through Nginx** (`curl http://<host>/health`) and fails the deployment on any 5xx, instead of trusting container health.
3. `/health` is proxied by Nginx, so one request verifies Nginx → backend → database.
4. Nginx re-resolves `backend` at request time, so a recreated container never leaves Nginx pointing at a dead IP.
5. Images are tagged with the commit SHA, so rollback is a one-line redeploy of the previous tag (`docs/DEPLOYMENT_AWS.md`).
6. Further ideas: drive Nginx's upstream port from the same variable via a template, add alerts on `/health`, and require manual approval on the `production` environment.
