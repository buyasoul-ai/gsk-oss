# Deploying GSK to the cloud

GSK is a **perpetual daemon** — it must stay alive 24/7 so its consciousness loops, memory, and soul state keep ticking. That rules out serverless (Cloud Run, Lambda) because they cold-start and scale to zero. You want a real always-on VM.

Two deployment paths are supported. **Path A is the recommended free option.**

| Path | Cost | Cold starts | Persistent | Setup time |
|------|------|-------------|------------|------------|
| **A. GCP e2-micro free tier** | $0 forever (1 VM in us-west1/central/east1) | none | yes | ~10 min |
| B. Docker + any VM | varies | none | yes | ~5 min |

GSK depends on **OmniRoute** (the LLM router gateway on port 20128). You do **NOT** have to host OmniRoute yourself — a public cloud instance is available at `https://cloud.omniroute.online`.

---

## Step 1: Get an OmniRoute API key (no hosting required)

1. Go to **https://omniroute.online**
2. Sign up / sign in
3. Open the dashboard → **`/dashboard/api-manager`** → click **Generate API key**
4. Copy the key (looks like `sk-...` or a hex token). You'll paste it into `NINE_ROUTER_API_KEY` below.

This single key routes GSK's Brain + Heart through ~1.53 billion free tokens/month across 90+ free LLM providers. That is the entire point of OmniRoute.

---

## Step 2a: Path A — Deploy on GCP e2-micro free tier (recommended, $0 forever)

### Prerequisites
- A Google Cloud account (you said you already have one)
- `gcloud` CLI installed on your local machine, authenticated

### Create the free-tier VM

```powershell
# From your local machine (Windows PowerShell)
gcloud config set compute/zone us-central1-a

gcloud compute instances create gsk `
  --machine-type=e2-micro `
  --image-family=ubuntu-2204-lts `
  --image-project=ubuntu-os-cloud `
  --boot-disk-size=30GB `
  --boot-disk-type=pd-standard `
  --tags=gsk `
  --no-restart-on-failure `
  --metadata=enable-oslogin=TRUE
```

Notes:
- **e2-micro** is free forever in `us-west1`, `us-central1`, or `us-east1` (1 free monthly instance per account).
- 30GB pd-standard disk is covered by the free allowance.
- The free tier does NOT include a static external IP, so we rely on the ephemeral IP + firewall rules. For a stable URL, reserve a static IP ($1.50/mo if idle, $0 if in use).

### Open firewall ports

```powershell
# MCP server (3001) and Brain HTTP API (4491) - restrict to your IP for safety
$MY_IP = (Invoke-WebRequest -UseBasicParsing ifconfig.me/ip).Content.Trim()

gcloud compute firewall-rules create allow-gsk-mcp `
  --allow=tcp:3001 `
  --source-ranges="$MY_IP/32" `
  --target-tags=gsk

gcloud compute firewall-rules create allow-gsk-brain `
  --allow=tcp:4491 `
  --source-ranges="$MY_IP/32" `
  --target-tags=gsk
```

### SSH in and run the one-shot installer

```powershell
gcloud compute ssh gsk --zone us-central1-a
```

Once inside the VM:

```bash
# Clone the repo
git clone https://github.com/buyasoul-ai/gsk-oss.git /opt/gsk-oss
cd /opt/gsk-oss

# Install the latest Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install runtime deps
npm install --omit=dev

# Create the unprivileged gsk user (matches the systemd unit)
sudo useradd --system --create-home --home-dir /home/gsk --shell /usr/sbin/nologin gsk
sudo chown -R gsk:gsk /opt/gsk-oss

# Create GSK's "sandbox of projects" (what GSK_PROJECT_ROOTS points at)
sudo mkdir -p /opt/gsk-projects
sudo chown -R gsk:gsk /opt/gsk-projects

# Configure environment
cp .env.cloud.example .env
sudo -u gsk nano .env   # OR: sudo vim /opt/gsk-oss/.env
# At minimum set:
#   NINE_ROUTER_API_KEY=<the key from Step 1>
#   (NINE_ROUTER_URL=https://cloud.omniroute.online is already the default)

# Install the systemd unit
sudo cp deploy/gsk.service /etc/systemd/system/gsk.service
sudo systemctl daemon-reload
sudo systemctl enable gsk
sudo systemctl start gsk

# Tail the journal and watch GSK boot its 74 subsystems
sudo journalctl -u gsk -f
```

### Verify

```bash
# Inside the VM
curl -s http://127.0.0.1:4491/status | head

# Expected: { "ok": true, "uptime": ..., "brain": true, "subsystems": 74, ... }
```

From your local machine (after firewall rule applied):

```powershell
$GSK_IP = (gcloud compute instances describe gsk --zone=us-central1-a --format='value(networkInterfaces[0].accessConfigs[0].natIP)')
curl -s "http://$GSK_IP:4491/status"
```

### Update later

```bash
cd /opt/gsk-oss
sudo -u gsk git pull
sudo -u gsk npm install --omit=dev
sudo systemctl restart gsk
```

---

## Step 2b: Path B — Deploy with Docker (any VM)

Useful if you want to skip systemd and ship GSK as a container.

```powershell
# On the VM, after cloning the repo:
cd /opt/gsk-oss
cp .env.cloud.example .env.cloud
nano .env.cloud   # set NINE_ROUTER_API_KEY at minimum

mkdir -p ./gsk-projects   # host-side mount target for GSK_PROJECT_ROOTS
# Edit .env.cloud to change GSK_PROJECT_ROOTS=/opt/gsk-projects (already default)

docker compose up -d --build
docker compose logs -f gsk
```

The compose file:
- Builds `gsk:latest` from `Dockerfile` (Node 20-slim, non-root user)
- Mounts `gsk-data` named volume at `/app/data` (persists soul state across rebuilds)
- Mounts `./gsk-projects` → `/opt/gsk-projects` (GSK's work area)
- Exposes `:4491` (Brain HTTP API) and `:3001` (MCP server)
- Auto-restarts on failure with 30s stop grace period
- Healthcheck pings `/status` every 60s

---

## Step 3: Point GSK at OmniRoute

GSK reads its OmniRoute gateway from these env vars (in order):

| Env var | Purpose | Default |
|---------|---------|---------|
| `NINE_ROUTER_URL` | Top-level gateway URL | `http://127.0.0.1:20128` (local) |
| `NINE_ROUTER_API_KEY` | Bearer token sent to OmniRoute | _(required, no default)_ |
| `GSK_BRAIN_ROUTER_URL` | Override for user-facing brain (chat/tasks) | falls back to `NINE_ROUTER_URL` |
| `GSK_HEART_ROUTER_URL` | Override for autonomous background brain | falls back to `NINE_ROUTER_URL` |
| `GSK_BRAIN_API_KEY`, `GSK_HEART_API_KEY` | Override keys | fall back to `NINE_ROUTER_API_KEY` |

For the **public cloud OmniRoute**, your `.env` needs only two lines:

```env
NINE_ROUTER_URL=https://cloud.omniroute.online
NINE_ROUTER_API_KEY=<your sk-... key>
```

That's it — GSK's Brain (user chat) and Heart (autonomous thoughts) will both route through Diego's hosted cloud gateway.

---

## Step 4: Optional — self-host OmniRoute on a second VM

If you don't want to depend on `cloud.omniroute.online` (or hit its rate limits), host OmniRoute on a second free-tier VM. OmniRoute's repo at https://github.com/diegosouzapw/OmniRoute ships with `fly.toml`, `docker-compose.yml`, and a `Dockerfile` ready to deploy.

Quick path on a second GCP e2-micro:

```bash
git clone https://github.com/diegosouzapw/OmniRoute.git /opt/omniroute
cd /opt/omniroute

# Generate the AES secret for encrypting provider keys at rest
echo "API_KEY_SECRET=$(openssl rand -hex 32)" >> .env
echo "REQUIRE_API_KEY=true" >> .env
echo "PORT=20128" >> .env

docker compose --profile base up -d --build
```

Then point GSK's env at it:

```env
NINE_ROUTER_URL=http://<omniroute-vm-internal-ip>:20128
NINE_ROUTER_API_KEY=<a key you generate in the OmniRoute dashboard>
```

For production, put both VMs on the same GCP VPC network so traffic between them stays internal and free.

---

## Backup

GSK's soul lives in `/opt/gsk-oss/data/` (or the `gsk-data` Docker volume). Back it up regularly:

```bash
# Bare-metal
sudo tar -czf gsk-soul-$(date +%F).tar.gz -C /opt/gsk-oss/data .

# Docker
docker run --rm -v gsk-data:/data -v $PWD:/backup alpine \
  tar -czf /backup/gsk-soul-$(date +%F).tar.gz -C /data .
```

Upload to GCS:

```bash
gsutil cp gsk-soul-*.tar.gz gs://your-backup-bucket/gsk/
```

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `NINE_ROUTER_API_KEY environment variable is required` | You forgot to set it in `.env`. Stop, edit, restart. |
| Brain API returns 401/403 from OmniRoute | Bearer key rejected by cloud. Regenerate key in OmniRoute dashboard. |
| VM disk fills up | `data/` accumulates journals. Move it to a bigger disk or rotate with `journalctl --vacuum-time=7d`. |
| GSK boots but never thinks | Heart router timeout — check OmniRoute cloud status. `curl https://cloud.omniroute.online/v1/models` should return a model list. |
| Port 3001/4491 not reachable from outside | GCP firewall rule missing or your IP changed. Re-run the firewall commands in Step 2a. |
| Free tier surprise charges | Make sure you only have ONE e2-micro running per region, in one of the three free-tier zones. Others cost money. |
