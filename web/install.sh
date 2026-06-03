#!/usr/bin/env bash
set -euo pipefail

INSTALL_DIR="/opt/bf_foot_l1"
SERVICE_NAME="bf_foot_l1"
NGINX_SNIPPET="/etc/nginx/snippets/bf_foot_l1_location.conf"
BRUNO_CONF="/etc/nginx/sites-available/bruno"
# install.sh lives in web/, repo root is one level up
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ $EUID -ne 0 ]]; then
  echo "Run as root: sudo bash web/install.sh" >&2
  exit 1
fi

echo "==> Checking Node.js..."
if ! command -v node &>/dev/null; then
  apt-get update -q
  apt-get install -y nodejs npm
else
  echo "    node $(node --version) already installed, skipping."
fi

echo "==> Copying project to $INSTALL_DIR..."
mkdir -p "$INSTALL_DIR"

# Always exclude scraper/data from rsync so live data is never overwritten.
# After rsync, restore data from the latest backup if the directory is empty.
DATA_DIR="$INSTALL_DIR/scraper/data"

# Backup existing data (timestamped) before rsync
if [[ -d "$DATA_DIR" ]] && [[ -n "$(ls -A "$DATA_DIR" 2>/dev/null)" ]]; then
  BAK="/opt/bf_foot_l1_data.bak.$(date +%Y%m%d_%H%M%S)"
  cp -r "$DATA_DIR" "$BAK"
  echo "    Existing data backed up to $BAK"
fi

rsync -a \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='scraper/data' \
  "$REPO_DIR/" "$INSTALL_DIR/"

mkdir -p "$DATA_DIR"

# If data directory is empty, restore from the most recent backup or seed from repo
if [[ -z "$(ls -A "$DATA_DIR" 2>/dev/null)" ]]; then
  LATEST_BAK="$(ls -1dt /opt/bf_foot_l1_data.bak.* 2>/dev/null | head -1)"
  if [[ -n "$LATEST_BAK" ]]; then
    cp -r "$LATEST_BAK/." "$DATA_DIR/"
    echo "    scraper/data restored from $LATEST_BAK"
  elif [[ -d "$REPO_DIR/scraper/data" ]] && [[ -n "$(ls -A "$REPO_DIR/scraper/data" 2>/dev/null)" ]]; then
    cp -r "$REPO_DIR/scraper/data/." "$DATA_DIR/"
    echo "    scraper/data seeded from repo."
  else
    echo "    scraper/data is empty — run manage-data to populate it."
  fi
else
  echo "    scraper/data preserved in place."
fi

echo "==> Installing web dependencies..."
cd "$INSTALL_DIR/web"
npm install --production --silent

echo "==> Installing scraper dependencies..."
cd "$INSTALL_DIR/scraper"
npm install --production --silent

echo "==> Setting permissions..."
chown -R www-data:www-data "$INSTALL_DIR"

echo "==> Installing systemd service..."
cp "$INSTALL_DIR/web/deploy/bf_foot_l1.service" "/etc/systemd/system/${SERVICE_NAME}.service"
systemctl daemon-reload
systemctl enable "$SERVICE_NAME"
systemctl restart "$SERVICE_NAME"
systemctl status "$SERVICE_NAME" --no-pager

echo "==> Configuring nginx..."
mkdir -p /etc/nginx/snippets
cp "$INSTALL_DIR/web/deploy/nginx-bf_foot_l1.conf" "$NGINX_SNIPPET"

if [[ -f "$BRUNO_CONF" ]]; then
  if grep -q "bf_foot_l1_location" "$BRUNO_CONF"; then
    sed -i "s|include .*/bf_foot_l1_location.conf;|include $NGINX_SNIPPET;|" "$BRUNO_CONF"
    echo "    Updated include path in $BRUNO_CONF"
  else
    sed -i '/listen 443 ssl/a\    include /etc/nginx/snippets/bf_foot_l1_location.conf;' "$BRUNO_CONF"
    echo "    Injected include into $BRUNO_CONF"
  fi
else
  echo "  WARNING: $BRUNO_CONF not found. Add manually to your nginx vhost:" >&2
  echo "    include $NGINX_SNIPPET;" >&2
fi

nginx -t
systemctl reload nginx

echo ""
echo "Done. Available at:"
echo "  https://bfablet92.hd.free.fr/bf_foot_l1/dashboard"
echo "  https://bfablet92.hd.free.fr/bf_foot_l1/manage-data"
