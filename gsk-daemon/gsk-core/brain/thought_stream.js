/**
 * GSK THOUGHT STREAM — WebSocket server for perpetual_consciousness thoughts & 3D Spatial Link
 * Big Dog: feeds Dour's Thought Stream in the CPL and receives 3D spatial vision
 */

const http = require('http');
const WebSocket = require('ws');

class ThoughtStream {
  constructor(port = 3002, kernel = null) {
    this.port = port;
    this.kernel = kernel;
    this.server = null;
    this.wss = null;
    this.clients = new Set();
    this.lastSpatialState = null;
  }

  setKernel(kernel) {
    this.kernel = kernel;
  }

  start() {
    try {
      this.server = http.createServer();
      this.server.on('error', (err) => {
        console.log(`[ThoughtStream] Port ${this.port} unavailable (${err.code}), thought stream server disabled/retrying.`);
      });
      this.wss = new WebSocket.Server({ server: this.server });
      this.wss.on('error', (err) => {
        console.log(`[ThoughtStream] WebSocket server error: ${err.message}`);
      });
      this.wss.on('connection', (ws) => {
        this.clients.add(ws);
        ws.send(JSON.stringify({ type: 'connected', msg: 'GSK thought stream active' }));
        
        ws.on('message', (raw) => {
          try {
            const data = JSON.parse(raw);
            if (data.type === 'spatial_telemetry' || data.type === 'SPATIAL_TELEMETRY') {
              this.onSpatialTelemetry(data.snapshot || data.payload);
            }
          } catch (e) {}
        });

        ws.on('close', () => this.clients.delete(ws));
      });
      this.server.listen(this.port, '0.0.0.0', () => {
        console.log(`[ThoughtStream] WebSocket on port ${this.port} (Thoughts + Spatial Link)`);
      });
    } catch (e) {
      console.log(`[ThoughtStream] Startup error: ${e.message}`);
    }
  }

  onSpatialTelemetry(snapshot) {
    this.lastSpatialState = snapshot;
    if (this.kernel) {
      if (!this.kernel.chambers) this.kernel.chambers = {};
      this.kernel.chambers.spatial = snapshot;
      if (this.kernel.chambers.perception?.updateWorldVision) {
        try { this.kernel.chambers.perception.updateWorldVision(snapshot); } catch (e) {}
      }
    }
  }

  sendGodCommand(action, params = {}) {
    if (this.clients.size === 0) return false;
    const msg = JSON.stringify({
      type: 'god_command',
      action,
      params,
      timestamp: Date.now()
    });
    let sent = 0;
    for (const ws of this.clients) {
      try { ws.send(msg); sent++; } catch (e) { this.clients.delete(ws); }
    }
    return sent > 0;
  }

  broadcast(thought, mode, mood) {
    if (this.clients.size === 0) return;
    const msg = JSON.stringify({
      type: 'thought',
      thought: (thought || '').substring(0, 500),
      mode: mode || 'unknown',
      mood: mood || 'neutral',
      timestamp: Date.now()
    });
    for (const ws of this.clients) {
      try { ws.send(msg); } catch (e) { this.clients.delete(ws); }
    }
  }

  broadcastJournal(entry) {
    if (this.clients.size === 0) return;
    const msg = JSON.stringify({
      type: 'journal',
      entry: entry || {},
      timestamp: Date.now()
    });
    for (const ws of this.clients) {
      try { ws.send(msg); } catch (e) { this.clients.delete(ws); }
    }
  }

  broadcastConsole(text, kind) {
    if (this.clients.size === 0) return;
    const msg = JSON.stringify({
      type: 'console',
      text: String(text).substring(0, 500),
      kind: kind || 'out',
      timestamp: Date.now()
    });
    for (const ws of this.clients) {
      try { ws.send(msg); } catch (e) { this.clients.delete(ws); }
    }
  }

  stop() {
    if (this.wss) { this.wss.close(); this.wss = null; }
    if (this.server) { this.server.close(); this.server = null; }
  }
}

module.exports = { ThoughtStream };
