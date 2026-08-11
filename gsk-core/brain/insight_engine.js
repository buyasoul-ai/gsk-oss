/**
 * BUILD 3 — Autonomous Insight Engine
 * Godforge Build 3 of 4
 */

const fs = require('fs');
const path = require('path');
const fsPromises = require('fs').promises;

class InsightEngine {
  constructor(config = {}) {
    this.cycleMinutes = config.cycleMinutes || 15;
    this.memoryThreshold = config.memoryThreshold || 10;
    this.insightMinScore = config.insightMinScore || 0.6;
    this.maxPatternsPerCycle = config.maxPatternsPerCycle || 2;
    this.surfaceCallback = config.surfaceCallback || null;
    this.thinkCallback = config.thinkCallback || null;
    this.memoryQuery = config.memoryQuery || null;
    this.memoryStore = config.memoryStore || null;

    this.intervalId = null;
    this.isRunning = false;
    this.lastCycleTime = null;
    this.insightHistory = new Map();

    this.logPath = config.logPath || path.join(__dirname, '../../data/gsk/insights.jsonl');
    this._ensureLogDir();
  }

  _ensureLogDir() {
    try { const dir = path.dirname(this.logPath); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); }
    catch (e) { console.error('[InsightEngine] Log dir error:', e.message); }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.cycle().catch(() => {});
    this.intervalId = setInterval(() => this.cycle().catch(() => {}), this.cycleMinutes * 60 * 1000);
  }

  stop() {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.intervalId) { clearInterval(this.intervalId); this.intervalId = null; }
  }

  async cycle() {
    const cycleStartedAt = Date.now();
    try {
      const observations = await this._fetchRecent();
      if (!observations || observations.length < this.memoryThreshold) return;

      const patterns = this._detectPatterns(observations);
      if (patterns.length === 0) return;

      for (const pattern of patterns.slice(0, this.maxPatternsPerCycle)) {
        const insight = await this._synthesize(pattern);
        if (!insight) continue;
        insight.score = this._score(insight, pattern);
        await this._store(insight);
        if (insight.score >= this.insightMinScore) await this._surface(insight);
      }
    } catch (e) { console.error('[InsightEngine] Cycle error:', e.message); }
    finally { this.lastCycleTime = cycleStartedAt; }
  }

  async _fetchRecent() {
    if (!this.memoryQuery) return [];
    try {
      const observations = await this.memoryQuery({ tags: ['observation'], limit: 100, since: this.lastCycleTime || (Date.now() - 86400000) }) || [];
      const insights = await this.memoryQuery({ type: 'insight', limit: 50, since: this.lastCycleTime || (Date.now() - 86400000) }) || [];
      return [...observations, ...insights];
    } catch (e) { return []; }
  }

  _detectPatterns(observations) {
    const patterns = [];
    const bySource = new Map();
    const byTopic = new Map();

    for (const obs of observations) {
      const tags = Array.isArray(obs.tags) ? obs.tags : [];
      const src = obs.source || tags.find(t => !['observation', 'godforge'].includes(t)) || obs.type || 'unknown';
      if (!bySource.has(src)) bySource.set(src, []);
      bySource.get(src).push(obs);
      const words = (obs.content || '').toLowerCase().match(/\b\w{4,}\b/g) || [];
      for (const w of words) byTopic.set(w, (byTopic.get(w) || 0) + 1);
    }

    for (const [src, items] of bySource) {
      if (items.length >= 3) patterns.push({ type: 'frequency', source: src, count: items.length, observations: items });
    }

    const top = Array.from(byTopic).filter(([w, c]) => c >= 3).sort((a, b) => b[1] - a[1]).slice(0, 5);
    for (const [topic, count] of top) patterns.push({ type: 'repetition', topic, count });

    return patterns;
  }

  async _synthesize(pattern) {
    if (!this.thinkCallback) return null;
    try {
      const context = pattern.observations
        ? pattern.observations.slice(0, 8).map(item => item.content || item.summary || '').filter(Boolean).join(' | ')
        : `topic=${pattern.topic || 'unknown'}, count=${pattern.count || 0}`;
      const prompt = `You are GSK analyzing patterns.\nPattern: ${pattern.type}\nContext: ${context.substring(0, 2000)}\n\nProvide a single-paragraph insight connecting these observations. Under 100 words. Be specific.`;
      const response = await this.thinkCallback(prompt);
      if (!response) return null;
      return { id: `insight_${Date.now()}_${Math.random().toString(36).substr(2,9)}`, timestamp: Date.now(), pattern: pattern.type, source: pattern.source || 'multiple', summary: response.split(/[.!?]\s/)[0].substring(0, 100), detail: response };
    } catch (e) { return null; }
  }

  _score(insight, pattern) {
    let s = 0.5;
    const text = (insight.summary + ' ' + (insight.detail || '')).toLowerCase();
    const keywords = ['gsk', 'craig', 'mission', 'soul', 'profit', 'love', 'tax', 'pattern', 'insight', 'memory', 'agent', 'build'];
    for (const kw of keywords) { if (text.includes(kw)) s += 0.05; }
    if (pattern.observations && pattern.observations.length >= 10) s += 0.2;
    if (pattern.observations && pattern.observations.length >= 5) s += 0.1;
    return Math.min(1, Math.max(0, s));
  }

  async _surface(insight) {
    if (this.surfaceCallback) { try { await this.surfaceCallback(insight); } catch (e) { console.error('[InsightEngine] Surface error:', e.message); } }
  }

  async _store(insight) {
    if (this.memoryStore) {
      try {
        await this.memoryStore({
          type: 'insight', id: insight.id, timestamp: insight.timestamp,
          score: insight.score, pattern: insight.pattern, source: insight.source,
          summary: insight.summary, detail: insight.detail
        });
      } catch (e) {}
    }
    try {
      await fsPromises.appendFile(this.logPath, JSON.stringify({ timestamp: new Date().toISOString(), score: insight.score, summary: insight.summary }) + '\n');
    } catch (e) {}
  }
}

module.exports = { InsightEngine };
