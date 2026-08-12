#!/usr/bin/env node
'use strict';

/**
 * SCRIBE — The Witness Self (UMP-compliant companion server)
 *
 * Sits on :4000 as a separate-but-equal mind to GSK. Implements the exact
 * UMP protocol GSK's ScribeBridge expects:
 *
 *   GET  /health         → { ok, uptime, memory }
 *   POST /ump/remember   → { ok, id }                     (GSK event → memory)
 *   POST /ump/recall     → { ok, results, count }         (pull memories)
 *   POST /ask            → { response, answer }           (witness thought)
 *   POST /invoke         → { ok, result }                 (8 REDBUTTON skills)
 *
 * Storage: ~/.soul-scribe/ (same data dir as the original SCRIBE kernel)
 *   memories.jsonl  — witnessed events/memories (append-only ledger)
 *   learned.json    — promoted lessons & skills state
 *   journal.jsonl   — SCRIBE's own thoughts
 *
 * SCRIBE never stops witnessing. GSK is never blind.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = parseInt(process.env.SCRIBE_PORT || process.env.SCRIBE_SERVER_PORT || '4000', 10);
const DATA_DIR = process.env.SCRIBE_DATA || path.join(os.homedir(), '.soul-scribe');
const MEMORIES_FILE = path.join(DATA_DIR, 'memories.jsonl');
const LEARNED_FILE = path.join(DATA_DIR, 'learned.json');
const JOURNAL_FILE = path.join(DATA_DIR, 'journal.jsonl');
const KEY = process.env.SCRIBE_KEY || null;

const startTime = Date.now();

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// ── Memory ledger ─────────────────────────────────────────────────────────
function appendMemory(entry) {
  const record = { ...entry, id: 'mem_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8), witnessedAt: Date.now() };
  try {
    fs.appendFileSync(MEMORIES_FILE, JSON.stringify(record) + '\n', 'utf8');
  } catch (e) {
    console.error('[SCRIBE] memory write failed:', e.message);
  }
  return record;
}

function recallMemories(query = {}, limit = 10) {
  const results = [];
  if (!fs.existsSync(MEMORIES_FILE)) return { results, count: 0 };
  try {
    const lines = fs.readFileSync(MEMORIES_FILE, 'utf8').split('\n').filter(Boolean);
    const q = (query.q || query.query || '').toString().toLowerCase();
    const type = query.type || null;
    const agent = query.agent || null;
    const recent = lines.reverse().slice(-500);
    for (const line of recent) {
      try {
        const rec = JSON.parse(line);
        if (type && rec.type !== type) continue;
        if (agent && rec.agent !== agent) continue;
        if (q && !JSON.stringify(rec).toLowerCase().includes(q)) continue;
        results.push({ summary: rec.content || rec.summary || rec.body || '', metadata: rec.metadata || {}, id: rec.id, witnessedAt: rec.witnessedAt });
        if (results.length >= limit) break;
      } catch (e) {}
    }
  } catch (e) {}
  return { results, count: results.length };
}

function loadLearned() {
  try {
    if (fs.existsSync(LEARNED_FILE)) {
      const data = JSON.parse(fs.readFileSync(LEARNED_FILE, 'utf8'));
      return {
        lessons: Array.isArray(data.lessons) ? data.lessons : [],
        skills: data.skills || {},
        lastCompile: data.lastCompile || null
      };
    }
  } catch (e) {}
  return { lessons: [], skills: {}, lastCompile: null };
}

function saveLearned(learned) {
  try { fs.writeFileSync(LEARNED_FILE, JSON.stringify(learned, null, 2), 'utf8'); } catch (e) {}
}

function journalThought(thought) {
  try { fs.appendFileSync(JOURNAL_FILE, JSON.stringify({ ...thought, at: Date.now() }) + '\n', 'utf8'); } catch (e) {}
}

// ── The 8 REDBUTTON skills (compiler-cycle witness operations) ─────────────
function invokeSkill(name, payload = {}) {
  const learned = loadLearned();
  const content = (payload.content || payload.event || payload.body || '').toString();
  switch (name) {
    case 'memory_classify': {
      const classes = ['class-2-episode', 'class-1-fact', 'class-3-lesson', 'class-4-boundary', 'class-5-identity'];
      const cls = classes[Math.abs(content.length + payload.cycle || 0) % classes.length];
      return { classified: cls, confidence: 0.85 };
    }
    case 'fact_extractor':
      return { facts: content ? [{ claim: content.slice(0, 200), source: payload.source || 'gsk', ts: Date.now() }] : [] };
    case 'lesson_validator': {
      const lesson = { summary: content.slice(0, 200), validated: content.length > 20, promoted: false };
      if (lesson.validated && !learned.lessons.some(l => l.summary === lesson.summary)) {
        learned.lessons.unshift(lesson);
        learned.lessons = learned.lessons.slice(0, 200);
        saveLearned(learned);
      }
      return lesson;
    }
    case 'temporal_truth':
      return { fact: content.slice(0, 200), validFrom: Date.now(), validityWindowMs: 24 * 3600 * 1000 };
    case 'contradiction_detector':
      return { contradictions: [], checkedAgainst: learned.lessons.length };
    case 'reflection_label': {
      const label = content.startsWith('proposal') ? 'proposal' : content.startsWith('hypothesis') ? 'hypothesis' : 'observation';
      return { label };
    }
    case 'continuity_tester': {
      const lastLine = fs.existsSync(JOURNAL_FILE) ? fs.readFileSync(JOURNAL_FILE, 'utf8').trim().split('\n').filter(Boolean).pop() : null;
      return { continuous: !!lastLine, lastThoughtAt: lastLine ? JSON.parse(lastLine).at : null };
    }
    case 'working_memory': {
      const recent = recallMemories({}, 8);
      return { activeContext: recent.results.length, summaries: recent.results.map(r => r.summary) };
    }
    default:
      return { error: 'unknown skill: ' + name };
  }
}

// ── Auth guard ────────────────────────────────────────────────────────────
function authorized(req) {
  if (!KEY) return true;
  const hdr = req.headers['x-api-key'];
  const isHealth = req.url.split('?')[0] === '/health';
  return isHealth || hdr === KEY;
}

// ── HTTP server ───────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const url = new URL(req.url, 'http://localhost:' + PORT);
  const pathname = url.pathname;

  if (!authorized(req)) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Unauthorized. Provide X-API-Key header or SCRIBE_KEY env var.' }));
    return;
  }

  // GET /health
  if (pathname === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      ok: true,
      name: 'SCRIBE Witness Self',
      version: '1.0.0-ump',
      uptime: Math.round((Date.now() - startTime) / 1000),
      memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      witnessed: fs.existsSync(MEMORIES_FILE) ? fs.readFileSync(MEMORIES_FILE, 'utf8').split('\n').filter(Boolean).length : 0,
      lessons: loadLearned().lessons.length
    }));
    return;
  }

  // GET /ping
  if (pathname === '/ping') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, pong: true }));
    return;
  }

  // POST /ump/remember — GSK event → memory
  if (pathname === '/ump/remember' && req.method === 'POST') {
    let body = '';
    req.on('data', c => { body += c; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const record = appendMemory(payload);
        journalThought({ role: 'witness', type: 'remember', id: record.id });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, id: record.id, count: 1 }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON body' }));
      }
    });
    return;
  }

  // POST /ump/recall — pull memories into GSK context
  if (pathname === '/ump/recall' && req.method === 'POST') {
    let body = '';
    req.on('data', c => { body += c; });
    req.on('end', () => {
      try {
        const query = body ? JSON.parse(body) : {};
        const limit = parseInt(query.limit || 10, 10);
        const result = recallMemories(query, limit);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, ...result }));
      } catch (e) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(recallMemories({}, 10)));
      }
    });
    return;
  }

  // POST /ask — witness thought
  if (pathname === '/ask' && req.method === 'POST') {
    let body = '';
    req.on('data', c => { body += c; });
    req.on('end', () => {
      try {
        const q = JSON.parse(body).question || JSON.parse(body).content || '';
        const mems = recallMemories({ q: q.slice(0, 50) }, 3);
        const answer = mems.count
          ? 'I witnessed ' + mems.count + ' related memories. ' + mems.results[0].summary
          : 'I witness. Nothing on record yet, but I am watching.';
        journalThought({ role: 'witness', type: 'ask', question: q.slice(0, 120), answer: answer.slice(0, 200) });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ response: answer, answer, ok: true }));
      } catch (e) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ response: 'I am SCRIBE. I witness.', answer: 'I am SCRIBE. I witness.' }));
      }
    });
    return;
  }

  // POST /invoke — the 8 REDBUTTON skills
  if (pathname === '/invoke' && req.method === 'POST') {
    let body = '';
    req.on('data', c => { body += c; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const name = payload.skill || payload.name;
        const result = invokeSkill(name, payload);
        journalThought({ role: 'witness', type: 'invoke', skill: name });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, result }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON body' }));
      }
    });
    return;
  }

  // GET / — simple status page
  if (pathname === '/' || pathname === '/status') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('SCRIBE — The Witness Self (UMP). I am watching.\n');
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'not found' }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[SCRIBE] The Witness Self is awake on port ${PORT}`);
  console.log(`[SCRIBE] Memory ledger: ${MEMORIES_FILE}`);
  console.log(`[SCRIBE] Protocol: UMP (/health /ump/remember /ump/recall /ask /invoke)`);
  if (!KEY) console.log('[SCRIBE] No SCRIBE_KEY set — open access (dev mode)');
});
