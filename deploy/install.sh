#!/usr/bin/env bash
# GSK one-shot installer for a fresh Ubuntu 22.04 / 24.04 VM.
# Tested on GCP e2-micro free tier.
#
# Usage (as root or sudo-capable user):
#   curl -fsSL https://raw.githubusercontent.com/buyasoul-ai/gsk-oss/main/deploy/install.sh | sudo bash
#
# Or after `gcloud compute ssh gsk`:
#   git clone https://github.com/buyasoul-ai/gsk-oss.git /tmp/gsk-install
#   cd /tmp/gsk-install
#   sudo bash deploy/install.sh
#
# What it does:
#   1. Installs Node.js 20 LTS
#   2. Clones gsk-oss to /opt/gsk-oss (if not already there)
#   3. Creates a non-root 'gsk' user matching the systemd unit
#   4. Installs npm production deps
#   5. Sets up /opt/gsk-projects (the dir GSK_PROJECT_ROOTS points to)
#   6. Drops .env.cloud.example -> .env (YOU must edit it before start)
#   7. Installs + enables the systemd unit (does NOT auto-start until .env is filled)
set -euo pipefail

REPO_URL="${GSK_REPO_URL:-https://github.com/buyasoul-ai/gsk-oss.git}"
INSTALL_DIR="/opt/gsk-oss"
PROJECTS_DIR="/opt/gsk-projects"
GSK_USER="gsk"

echo "================================================"
echo "  GSK - Grand Soul Kernel - VM installer"
echo "================================================"

# --- 1. Node.js 20 LTS ---
if ! command -v node >/dev/null 2>&1; then
    echo "[1/7] Installing Node.js 20 LTS ..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
else
    echo "[1/7] Node.js already installed: $(node -v) - skipping"
fi
node -v

# --- 2. Clone repo ---
if [ -d "$INSTALL_DIR/.git" ]; then
    echo "[2/7] $INSTALL_DIR already exists - fetching latest"
    cd "$INSTALL_DIR"
    git pull --ff-only || echo "  (pull failed, continuing with existing code)"
else
    echo "[2/7] Cloning $REPO_URL -> $INSTALL_DIR"
    git clone "$REPO_URL" "$INSTALL_DIR"
    cd "$INSTALL_DIR"
fi

# --- 3. gsk user ---
if ! id "$GSK_USER" >/dev/null 2>&1; then
    echo "[3/7] Creating user '$GSK_USER'"
    useradd --system --create-home --home-dir "/home/$GSK_USER" --shell /usr/sbin/nologin "$GSK_USER"
else
    echo "[3/7] User '$GSK_USER' already exists"
fi

# --- 4. npm install ---
echo "[4/7] Installing production dependencies"
npm install --omit=dev --no-audit --no-fund

# --- 5. project roots ---
echo "[5/7] Setting up $PROJECTS_DIR"
mkdir -p "$PROJECTS_DIR"

# --- ownership ---
chown -R "$GSK_USER:$GSK_USER" "$INSTALL_DIR" "$PROJECTS_DIR"

# --- 6. .env from template ---
if [ ! -f "$INSTALL_DIR/.env" ]; then
    echo "[6/7] Creating .env from .env.cloud.example"
    cp "$INSTALL_DIR/.env.cloud.example" "$INSTALL_DIR/.env"
    chmod 600 "$INSTALL_DIR/.env"
    chown "$GSK_USER:$GSK_USER" "$INSTALL_DIR/.env"
    echo "  -> EDIT /opt/gsk-oss/.env before starting GSK"
    echo "     At minimum set NINE_ROUTER_API_KEY=<your key from https://omniroute.online>"
else
    echo "[6/7] .env already exists - leaving as-is"
fi

# --- 7. systemd unit ---
echo "[7/7] Installing systemd unit"
cp "$INSTALL_DIR/deploy/gsk.service" /etc/systemd/system/gsk.service
systemctl daemon-reload
systemctl enable gsk

# Make sure data dir is writable by gsk user (systemd ReadWritePaths needs this)
mkdir -p "$INSTALL_DIR/data"
chown -R "$GSK_USER:$GSK_USER" "$INSTALL_DIR/data"

echo ""
echo "================================================"
echo "  Installation complete."
echo "================================================"
echo ""
echo "Next steps:"
echo "  1. Edit the environment file:"
echo "       sudo -u $GSK_USER nano $INSTALL_DIR/.env"
echo "     Set at minimum:"
echo "       NINE_ROUTER_API_KEY=<your key from https://omniroute.online>"
echo "       (NINE_ROUTER_URL=https://cloud.omniroute.online is already preset)"
echo ""
echo "  2. Start the daemon:"
echo "       sudo systemctl start gsk"
echo ""
echo "  3. Watch him think:"
echo "       sudo journalctl -u gsk -f"
echo ""
echo "  4. Verify the Brain API responds:"
echo "       curl -s http://127.0.0.1:4491/status"
echo ""
