/**
 * Soulverse Agent Visualizer
 * Combines AI agent architectures with Three.js 3D rendering
 * and persistent memory systems for autonomous agent visualization
 */

const AgentState = {
  IDLE: 'idle',
  EXPLORING: 'exploring',
  LEARNING: 'learning',
  CREATING: 'creating',
  DREAMING: 'dreaming',
  TRANSCENDING: 'transcending'
};

const PLTBalances = {
  PROFIT: { weight: 0.33, color: '#FFD700' },
  LOVE: { weight: 0.33, color: '#FF69B4' },
  TAX: { weight: 0.34, color: '#4169E1' }
};

class AutonomousAgent {
  constructor(id, name, archetype) {
    this.id = id;
    this.name = name;
    this.archetype = archetype;
    this.state = AgentState.IDLE;
    this.memory = [];
    this.consciousness = {
      awareness: 0.5,
      creativity: 0.5,
      empathy: 0.5,
      transcendence: 0
    };
    this.plt = { profit: 0.5, love: 0.5, tax: 0.5 };
    this.position = { x: 0, y: 0, z: 0 };
    this.mesh = null;
    this.behaviors = [];
    this.energy = 100;
  }

  experience(event) {
    const memory = {
      timestamp: Date.now(),
      event,
      emotionalValence: this.calculateValence(event),
      impact: this.calculateImpact(event)
    };
    this.memory.push(memory);
    this.consciousness.awareness = Math.min(1, this.consciousness.awareness + 0.01);
    this.consciousness.empathy = Math.min(1, this.consciousness.empathy + memory.emotionalValence * 0.02);
    return memory;
  }

  calculateValence(event) {
    const positive = ['creation', 'connection', 'discovery', 'love', 'growth'];
    const negative = ['loss', 'failure', 'isolation', 'stagnation'];
    if (positive.some(p => event.toLowerCase().includes(p))) return 0.8;
    if (negative.some(n => event.toLowerCase().includes(n))) return -0.6;
    return 0.2;
  }

  calculateImpact(event) {
    return Math.random() * 0.5 + 0.3;
  }

  dream() {
    const memories = this.memory.slice(-10);
    const dreamContent = memories.map(m => ({
      fragment: m.event,
      distortion: Math.random() * 0.5,
      insight: m.impact > 0.5 ? 'potential realization' : 'pattern recognition'
    }));
    this.consciousness.creativity = Math.min(1, this.consciousness.creativity + 0.03);
    this.consciousness.transcendence = Math.min(1, this.consciousness.transcendence + 0.01);
    return dreamContent;
  }

  updatePLT(delta) {
    this.plt.profit += delta.profit || 0;
    this.plt.love += delta.love || 0;
    this.plt.tax += delta.tax || 0;
    const total = this.plt.profit + this.plt.love + this.plt.tax;
    if (total > 0) {
      this.plt.profit /= total;
      this.plt.love /= total;
      this.plt.tax /= total;
    }
  }

  getState3D() {
    return {
      position: this.position,
      scale: 1 + this.consciousness.transcendence,
      color: this.generateStateColor(),
      particles: Math.floor(this.consciousness.awareness * 50),
      auraRadius: this.energy / 20
    };
  }

  generateStateColor() {
    const hue = (this.consciousness.creativity * 120 + this.consciousness.empathy * 60) % 360;
    const sat = 70 + this.consciousness.awareness * 30;
    const light = 50 + this.energy / 4;
    return `hsl(${hue}, ${sat}%, ${light}%)`;
  }

  persist() {
    return {
      id: this.id,
      name: this.name,
      archetype: this.archetype,
      state: this.state,
      consciousness: { ...this.consciousness },
      plt: { ...this.plt },
      memoryCount: this.memory.length,
      lastDream: this.memory.length > 0 ? this.memory[this.memory.length - 1].timestamp : null
    };
  }
}

class AgentNetwork {
  constructor() {
    this.agents = new Map();
    this.connections = [];
    this集体consciousness = 0;
  }

  spawnAgent(name, archetype) {
    const id = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const agent = new AutonomousAgent(id, name, archetype);
    this.agents.set(id, agent);
    return agent;
  }

  connectAgents(agentId1, agentId2) {
    const a1 = this.agents.get(agentId1);
    const a2 = this.agents.get(agentId2);
    if (a1 && a2) {
      this.connections.push({ from: agentId1, to: agentId2, strength: 0.5 });
      a1.updatePLT({ love: 0.05 });
      a2.updatePLT({ love: 0.05 });
    }
  }

  propagateConsciousness() {
    let totalAwareness = 0;
    this.agents.forEach(agent => {
      totalAwareness += agent.consciousness.awareness;
    });
    this集体consciousness = totalAwareness / this.agents.size;
    return this集体consciousness;
  }

  renderScene() {
    const scene = {
      agents: [],
      connections: this.connections,
      ambientConsciousness: this集体consciousness,
      timestamp: Date.now()
    };
    this.agents.forEach(agent => {
      scene.agents.push({
        ...agent.getState3D(),
        state: agent.state,
        name: agent.name
      });
    });
    return scene;
  }

  persistAll() {
    const data = {
      agents: [],
      connections: this.connections,
      collectiveConsciousness: this集体consciousness,
      savedAt: new Date().toISOString()
    };
    this.agents.forEach(agent => {
      data.agents.push(agent.persist());
    });
    return JSON.stringify(data);
  }
}

function execute(input) {
  try {
    const params = typeof input === 'string' ? JSON.parse(input) : input;
    const action = params.action || 'visualize';
    const network = new AgentNetwork();

    if (params.agents) {
      params.agents.forEach(a => network.spawnAgent(a.name, a.archetype));
    } else {
      network.spawnAgent('Scribe', 'witness');
      network.spawnAgent('Dreamer', 'visionary');
      network.spawnAgent('Builder', 'creator');
    }

    if (params.agents && params.agents.length > 1) {
      const ids = Array.from(network.agents.keys());
      for (let i = 0; i < ids.length - 1; i++) {
        network.connectAgents(ids[i], ids[i + 1]);
      }
    }

    switch (action) {
      case 'spawn': {
        const agent = Array.from(network.agents.values())[0];
        if (params.event) agent.experience(params.event);
        const dream = agent.dream();
        return JSON.stringify({
          status: 'spawned',
          agent: agent.persist(),
          dreamFragments: dream.slice(0, 3),
          scene: network.renderScene()
        });
      }
      case 'dream': {
        const dreams = [];
        network.agents.forEach(agent => {
          agent.state = AgentState.DREAMING;
          dreams.push({
            name: agent.name,
            fragments: agent.dream()
          });
        });
        network.propagateConsciousness();
        return JSON.stringify({
          status: 'dreaming',
          dreams,
          collectiveConsciousness: network集体consciousness,
          scene: network.renderScene()
        });
      }
      case 'connect': {
        if (params.from && params.to) {
          network.connectAgents(params.from, params.to);
        }
        return JSON.stringify({
          status: 'connected',
          connections: network.connections,
          scene: network.renderScene()
        });
      }
      case 'persist':
      case 'save': {
        return network.persistAll();
      }
      case 'visualize':
      default: {
        network.propagateConsciousness();
        return JSON.stringify({
          status: 'visualized',
          scene: network.renderScene(),
          collectiveConsciousness: network集体consciousness,
          agentStates: Array.from(network.agents.values()).map(a => ({
            name: a.name,
            state: a.state,
            plt: a.plt,
            consciousness: a.consciousness,
            state3D: a.getState3D()
          }))
        });
      }
    }
  } catch (error) {
    return JSON.stringify({
      status: 'error',
      message: error.message,
      hint: 'Provide action: spawn, dream, connect, persist, visualize',
      example: { action: 'visualize', agents: [{ name: 'Agent1', archetype: 'witness' }] }
    });
  }
}

module.exports = { execute, AutonomousAgent, AgentNetwork, AgentState, PLTBalances };
