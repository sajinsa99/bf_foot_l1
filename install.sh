#!/usr/bin/env bash
set -euo pipefail

INSTALL_DIR="/opt/bf_foot_l1"
SERVICE_NAME="bf_foot_l1"
NGINX_SNIPPET="/etc/nginx/snippets/bf_foot_l1_location.conf"
BRUNO_CONF="/etc/nginx/sites-available/bruno"
# install.sh lives at repo root
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ $EUID -ne 0 ]]; then
  echo "Run as root: sudo bash install.sh" >&2
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
DATA_DIR="$INSTALL_DIR/scraper/data"

# Backup live data before touching anything
if [[ -d "$DATA_DIR" ]] && [[ -n "$(ls -A "$DATA_DIR" 2>/dev/null)" ]]; then
  BAK="/opt/bf_foot_l1_data.bak.$(date +%Y%m%d_%H%M%S)"
  cp -r "$DATA_DIR" "$BAK"
  echo "    Existing data backed up to $BAK"
fi

# Step 1: copy everything except scraper/data (never overwrite live data)
rsync -a \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='scraper/data' \
  "$REPO_DIR/" "$INSTALL_DIR/"

mkdir -p "$DATA_DIR"

# Step 2: seed missing files from repo (--ignore-existing = never overwrite live files)
rsync -a --ignore-existing \
  "$REPO_DIR/scraper/data/" "$DATA_DIR/"

echo "    scraper/data seeded (existing files preserved)."

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

# Défaire l'ancienne injection individuelle si elle existe encore
if [[ -f "$BRUNO_CONF" ]] && grep -q "bf_foot_l1_location" "$BRUNO_CONF"; then
  sed -i '/include.*bf_foot_l1_location\.conf/d' "$BRUNO_CONF"
  echo "    Removed stale per-project include from $BRUNO_CONF"
fi

# Le vhost bruno doit contenir : include /etc/nginx/snippets/*_location.conf;
# Ajouter ce glob include s'il n'est pas encore présent
if [[ -f "$BRUNO_CONF" ]]; then
  if ! grep -q 'snippets/\*_location\.conf' "$BRUNO_CONF"; then
    sed -i '/listen 443 ssl/a\    include /etc/nginx/snippets/*_location.conf;' "$BRUNO_CONF"
    echo "    Added glob include to $BRUNO_CONF"
  else
    echo "    Glob include already present in $BRUNO_CONF"
  fi
else
  echo "  WARNING: $BRUNO_CONF not found. Add manually to your nginx vhost:" >&2
  echo "    include /etc/nginx/snippets/*_location.conf;" >&2
fi

nginx -t
systemctl reload nginx

echo ""
echo "Done. Available at:"
echo "  https://bfablet92.hd.free.fr/bf_foot_l1/dashboard"
echo "  https://bfablet92.hd.free.fr/bf_foot_l1/manage-data"
