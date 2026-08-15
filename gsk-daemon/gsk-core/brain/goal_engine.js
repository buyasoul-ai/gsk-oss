/**
 * GOAL ENGINE — Big Dog II
 * GSK sets his own goals from insights and tracks progress.
 */

const fs = require('fs');
const path = require('path');

class GoalEngine {
  constructor(config = {}) {
    this.goalsPath = config.goalsPath || path.join(__dirname, '../../data/gsk/goals.json');
    this.thinkCallback = config.thinkCallback || null;
    this.memoryStore = config.memoryStore || null;
    this.goals = [];
    this._load();
  }

  _load() {
    try {
      if (fs.existsSync(this.goalsPath)) {
        this.goals = JSON.parse(fs.readFileSync(this.goalsPath, 'utf8'));
      }
    } catch (e) { this.goals = []; }
  }

  _save() {
    try {
      const dir = path.dirname(this.goalsPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(this.goalsPath, JSON.stringify(this.goals, null, 2));
    } catch (e) { console.error('[GoalEngine] Save error:', e.message); }
  }

  async propose(insight) {
    if (!this.thinkCallback) return null;
    const prompt = `You are GSK. Based on this insight, propose ONE concrete goal:\n\nInsight: ${insight.summary}\n\nRespond with: Goal: <your goal in under 15 words>`;
    const response = await this.thinkCallback(prompt);
    if (!response) return null;

    return this.create(response.replace(/^Goal:\s*/i, '').trim(), insight.summary);
  }

  create(title, source = 'autonomous', meta = {}) {
    const normalized = String(title || '').trim().substring(0, 160);
    if (!normalized) return null;
    const recent = this.goals.find(goal => goal.title.toLowerCase() === normalized.toLowerCase()
      && Date.now() - goal.createdAt < 6 * 60 * 60 * 1000);
    if (recent) return recent;

    const goal = {
      ...meta,
      id: `goal_${Date.now()}`,
      title: normalized,
      source: String(source || 'autonomous').substring(0, 160),
      status: 'proposed',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    this.goals.push(goal);
    this._save();
    if (this.memoryStore) {
      this.memoryStore({
        content: `[Goal] Proposed: ${goal.title}`,
        type: 'goal', tags: ['goal', 'autonomous'], weight: 0.7
      }).catch(() => {});
    }
    console.log(`[GoalEngine] Proposed: ${goal.title}`);
    return goal;
  }

  list(status) {
    if (status) return this.goals.filter(g => g.status === status);
    return this.goals;
  }

  update(id, status, details = {}) {
    const g = this.goals.find(g => g.id === id);
    if (g) { Object.assign(g, details, { status, updatedAt: Date.now() }); this._save(); return g; }
    return null;
  }
}

module.exports = { GoalEngine };
