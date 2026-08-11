/**
 * CURIOSITY DRIVE — Big Dog II
 * GSK proactively seeks new information when idle.
 */

const http = require('http');

class BigDogCuriosity {
  constructor(config = {}) {
    this.thinkCallback = config.thinkCallback || null;
    this.memoryStore = config.memoryStore || null;
    this.intervalMinutes = config.intervalMinutes || 30;
    this.intervalId = null;
    this.topics = [
      'WebGPU compute shaders for spatial 3D engines',
      'Model Context Protocol MCP tool execution standards',
      'vector memory indexing for autonomous agents',
      'Three.js instanced rendering techniques',
      'Logseq markdown knowledge graph integration',
      'WebSocket state synchronization for game engines',
      'autonomous multi-agent handoff patterns',
      'real-time spatial audio rendering WebAudio',
      'dynamic prompt compilation for cognitive agents',
      'self-governance and PLT framework alignment',
    ];
    this.researchedSet = new Set();
    this.topicIndex = Math.floor(Math.random() * this.topics.length);
  }

  start() {
    if (this.intervalId) return;
    console.log(`[Curiosity] Starting — explores every ${this.intervalMinutes}min`);
    setTimeout(() => this._explore(), 120000); // First explore after 2 min
    this.intervalId = setInterval(() => this._explore(), this.intervalMinutes * 60 * 1000);
  }

  stop() {
    if (this.intervalId) { clearInterval(this.intervalId); this.intervalId = null; }
  }

  async _explore() {
    let topic = this.topics[this.topicIndex % this.topics.length];
    this.topicIndex++;

    if (this.researchedSet.has(topic)) {
      topic = `real-time spatial engineering: ${topic}`;
    }
    this.researchedSet.add(topic);

    console.log(`[Curiosity] Exploring: ${topic}`);

    if (this.thinkCallback) {
      try {
        const prompt = `You are GSK, an autonomous engineer seeking real knowledge. Research this technical topic for our codebase: ${topic}\n\nProvide 2 concrete implementation insights we can build today. Do not repeat general fluff — provide actionable technical facts.`;
        const result = await this.thinkCallback(prompt);
        if (result && this.memoryStore) {
          await this.memoryStore({
            content: `[Curiosity] Explored "${topic}":\n${result}`,
            type: 'curiosity',
            tags: ['curiosity', 'learning', 'autonomous', 'technical'],
            weight: 0.6
          });
          console.log(`[Curiosity] Captured new technical insight for: ${topic}`);
        }
      } catch (e) {
        console.log(`[Curiosity] Explore error: ${e.message}`);
      }
    }
  }
}

// Old CuriosityDrive for emotions system (kept for compatibility)
class CuriosityDrive {
  constructor(brain, chambers, memory) { this.brain = brain; this.chambers = chambers; this.memory = memory; this.topics = []; this.topicIndex = 0; }
  tick(ts) { /* old emotions system — no-op */ }
}

module.exports = { CuriosityDrive, BigDogCuriosity };
