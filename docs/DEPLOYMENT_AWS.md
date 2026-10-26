# Deploy to AWS EC2

## 1. Launch the instance
Ubuntu 22.04/24.04 LTS, `t3.micro` or `t3.small` (the free tier works but is tight with 3 containers; add 1–2 GB swap if builds or startup are killed), 20 GB gp3. Create a key pair and keep the `.pem`. Attach a security group with exactly these rules, and allocate an Elastic IP so the URL survives reboots.

| Direction | Port | Source | Why |
|---|---|---|---|
| Inbound | 22/tcp | **my IP only** (`x.x.x.x/32`) | SSH for admin and the pipeline* |
| Inbound | 80/tcp | 0.0.0.0/0 | public site (Nginx) |
| Inbound | 443/tcp | 0.0.0.0/0 | HTTPS once a certificate is added |
| Inbound | 5000, 5432, 8080 | **none** | API and DB are internal-only |
| Outbound | all | 0.0.0.0/0 | image pulls, apt |

\* GitHub-hosted runners come from changing IPs, so SSH from the pipeline needs 22 open to the internet (key-only auth, `fail2ban`) or a self-hosted runner / SSM. State your choice in the README and prefer key-only SSH with `PasswordAuthentication no`.

## 2. Prepare the server
```bash
scp -i key.pem deploy/ec2-setup.sh ubuntu@<ip>:~ && ssh -i key.pem ubuntu@<ip> 'bash ec2-setup.sh'
# log out and in again, then create the secrets file ON THE SERVER:
ssh -i key.pem ubuntu@<ip>
cd ~/localbizhub && nano .env       # copy from .env.example
chmod 600 .env
```
Production `.env`: `CORS_ORIGIN=http://<ip>`, strong `JWT_SECRET`/`POSTGRES_PASSWORD`/`ADMIN_PASSWORD`, `SEED_DEMO_DATA=false` (or `true` for the demo).

## 3. Deploy
Add the GitHub secrets (`EC2_HOST`, `EC2_USER=ubuntu`, `EC2_SSH_KEY`, `GHCR_PULL_TOKEN`), push to `main`, and watch Actions. Open `http://<ip>` and `http://<ip>/health`.

Manual deploy or rollback on the server:
```bash
cd ~/localbizhub && export GHCR_OWNER=<github-user-lowercase> IMAGE_TAG=<commit-sha>
docker compose -f docker-compose.prod.yml pull && docker compose -f docker-compose.prod.yml up -d
```
Rolling back = run the same command with the previous commit SHA.

## 4. Operate
`./scripts/monitor.sh docker-compose.prod.yml` (copy the script to the server) · `docker compose -f docker-compose.prod.yml logs -f` · back up with `docker compose exec db pg_dump -U localbizhub localbizhub > backup.sql`.
