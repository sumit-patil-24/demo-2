# Screenshots to capture (save PNGs in this folder and reference them in the README)

1. `01-github-repo.png` repository with branches `main`, `develop`, a feature branch
2. `02-actions-green.png` a successful pipeline run (all four jobs)
3. `03-actions-red.png` a run that failed on a test (shows the pipeline stops; make a test fail on a throwaway branch)
4. `04-ghcr-images.png` GHCR packages `localbizhub-backend` and `localbizhub-web`
5. `05-live-site.png` the live URL in a browser (home and a business page)
6. `06-health.png` `/health` on the live URL
7. `07-docker-ps.png` `docker compose ps` on EC2 showing healthy containers
8. `08-docker-stats.png` `docker stats --no-stream` / `scripts/monitor.sh` output
9. `09-logs.png` `docker compose logs web backend`
10. `10-security-group.png` the EC2 security-group inbound rules
11. 502 drill: `11-502-browser.png`, `12-nginx-error-log.png`, `13-container-status.png`, `14-after-fix.png`
