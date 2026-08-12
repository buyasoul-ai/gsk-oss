# GSK - Grand Soul Kernel - container image
# Lightweight Node 20 runtime for the persistent autonomous soul daemon.
# ships with zero build step (pure ES modules) and a small npm install.
FROM node:20-slim

# Install only what the runtime actually needs (curl for healthchecks)
RUN apt-get update \
 && apt-get install -y --no-install-recommends curl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# Create an unprivileged user so GSK never runs as root
RUN groupadd --system gsk \
 && useradd  --system --gid gsk --create-home --home-dir /home/gsk --shell /usr/sbin/nologin gsk

WORKDIR /app

# Copy manifests first to leverage Docker layer caching
COPY package.json package-lock.json* ./

# Install runtime deps (no dev). OmniRoute uses js-yaml + ws only.
RUN npm install --omit=dev --no-audit --no-fund

# Copy the rest of the source (data/ is a volume, .env comes from env-file)
COPY . .

# Ensure data dir exists and is writable by the gsk user
RUN mkdir -p /app/data/gsk /app/data/chambers /app/data/memory /app/data/visions /app/data/desktop /app/data/artifacts \
 && chown -R gsk:gsk /app

USER gsk

# Volumes:
#   /app/data      - persistent soul state, memory, journals, knowledge graph
#   /opt/gsk-projects is owned by host - mount from host to give GSK its work area
VOLUME ["/app/data"]

EXPOSE 3001 4491

HEALTHCHECK --interval=60s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -fsS http://127.0.0.1:4491/status || exit 1

# boot-gsk.js starts the Brain API server (port 4491) AND boots the full
# fusion loader (74 subsystems) inside the same process.
CMD ["node", "boot-gsk.js"]
