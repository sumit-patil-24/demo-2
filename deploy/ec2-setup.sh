#!/usr/bin/env bash
# Run ONCE on a fresh Ubuntu 22.04/24.04 EC2 instance:   bash ec2-setup.sh
set -euo pipefail

sudo apt-get update -y
sudo apt-get install -y ca-certificates curl gnupg ufw fail2ban

# Docker Engine + Compose plugin (official repo)
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker "$USER"

# Host firewall (in addition to the AWS security group)
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# App directory; create ~/localbizhub/.env here by hand (see .env.example). Never commit it.
mkdir -p ~/localbizhub
echo "Done. Log out and back in so the docker group applies, then create ~/localbizhub/.env"
