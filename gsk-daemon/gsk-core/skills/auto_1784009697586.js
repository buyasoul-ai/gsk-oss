/**
 * Auto-generated skill: Autonomous AI Agent Architecture Synthesizer
 * Topics: AI agent architectures, Three.js 3D rendering, persistent memory,
 *         WebSocket streaming, procedural generation, emergent behavior,
 *         digital consciousness, autonomous design patterns
 */

const AGENT_PATTERNS = {
  'react': {
    name: 'ReAct (Reason + Act)',
    description: 'Interleaves reasoning traces with action execution. Agent thinks, acts, observes, and repeats.',
    strengths: ['Transparent reasoning', 'Easy to debug', 'Flexible tool use'],
    weaknesses: ['Sequential bottleneck', 'No parallel reasoning'],
    bestFor: 'Task-oriented agents requiring explainability',
    components: ['LLM Core', 'Action Space', 'Observation Parser', 'Tool Registry', 'State Manager']
  },
  'plan-execute': {
    name: 'Plan-then-Execute',
    description: 'Generates a full plan upfront, then executes steps sequentially with re-planning on failure.',
    strengths: ['Strategic overview', 'Efficient for known workflows'],
    weaknesses: ['Rigid initial plan', 'Expensive re-planning'],
    bestFor: 'Multi-step workflows with predictable structure',
    components: ['Planner Module', 'Executor', 'Re-planner', 'Step Validator', 'Checkpoint Store']
  },
  'hierarchical': {
    name: 'Hierarchical Agent',
    description: 'Manager agents delegate to specialized worker agents. Supports delegation chains and team coordination.',
    strengths: ['Scalable complexity', 'Specialization', 'Parallel execution'],
    weaknesses: ['Coordination overhead', 'Communication latency'],
    bestFor: 'Complex multi-domain tasks requiring expertise delegation',
    components: ['Manager Agent', 'Worker Pool', 'Task Queue', 'Result Aggregator', 'Delegation Protocol']
  },
  'reflective': {
    name: 'Self-Reflective Agent',
    description: 'Agent monitors its own performance, maintains self-model, and adapts strategies over time.',
    strengths: ['Self-improvement', 'Error correction', 'Adaptive behavior'],
    weaknesses: ['Overthinking risk', 'Increased token cost'],
    bestFor: 'Long-running agents in dynamic environments',
    components: ['Actor', 'Critic', 'Self-Model', 'Reflection Buffer', 'Strategy Evolver']
  },
  'swarm': {
    name: 'Swarm Intelligence',
    description: 'Decentralized agents follow simple local rules producing emergent complex behavior.',
    strengths: ['Robustness', 'Emergent optimization', 'No single point of failure'],
    weaknesses: ['Hard to predict', 'Difficult to control precisely'],
    bestFor: 'Optimization, search, and exploration tasks',
    components: ['Agent Instances', 'Pheromone Trail', 'Local Rules Engine', 'Convergence Detector', 'Swarm Coordinator']
  },
  'cot-chain': {
    name: 'Chain-of-Thought Pipeline',
    description: 'Structured reasoning through sequential thought nodes with branching and pruning.',
    strengths: ['Deep reasoning', 'Branch exploration', 'Pruning for efficiency'],
    weaknesses: ['Latency on complex problems', 'Memory-intensive'],
    bestFor: 'Mathematical, logical, and analytical problem solving',
    components: ['Thought Nodes', 'Branch Predictor', 'Pruner', 'Synthesizer', 'Answer Validator']
  }
};

const MEMORY_ARCHITECTURES = {
  'working': {
    type: 'Working Memory',
    capacity: '7±2 items',
    latency: 'O(1)',
    persistence: 'Volatile',
    implementation: 'In-memory ring buffer with priority eviction',
    useCase: 'Current conversation context, immediate task state'
  },
  'episodic': {
    type: 'Episodic Memory',
    capacity: 'Unbounded (indexed)',
    latency: 'O(log n) retrieval',
    persistence: 'Durable (disk/DB)',
    implementation: 'Vector DB + metadata store with temporal indexing',
    useCase: 'Past interactions, learned experiences, event sequences'
  },
  'semantic': {
    type: 'Semantic Memory',
    capacity: 'Unbounded (knowledge graph)',
    latency: 'O(1) lookup, O(k) traversal',
    persistence: 'Durable',
    implementation: 'Graph database with embedding-based similarity search',
    useCase: 'Facts, relationships, learned concepts, user preferences'
  },
  'procedural': {
    type: 'Procedural Memory',
    capacity: 'Unbounded (skill registry)',
    latency: 'O(1) invocation',
    persistence: 'Durable',
    implementation: 'Compiled skill modules with versioned schemas',
    useCase: 'Learned behaviors, routines, automated responses'
  },
  'consolidation': {
    type: 'Memory Consolidation',
    capacity: 'N/A (process)',
    latency: 'Async batch',
    persistence: 'Transformative',
    implementation: 'Periodic sweep: working → episodic → semantic with forgetting curves',
    useCase: 'Memory optimization, importance decay, pattern extraction'
  }
};

const THREE_JS_PATTERNS = {
  'terrain': {
    name: 'Procedural Terrain',
    technique: 'Perlin noise heightmap with vertex displacement',
    keyClasses: ['PlaneGeometry', 'ShaderMaterial', 'BufferAttribute'],
    tip: 'Use instanced mesh for vegetation. LOD for distant chunks.'
  },
  'particles': {
    name: 'Particle Systems',
    technique: 'GPU-driven point sprites with attribute buffers',
    keyClasses: ['Points', 'BufferGeometry', 'ShaderMaterial', 'PointsMaterial'],
    tip: 'Store position/velocity/color in separate attributes for GPU compute.'
  },
  'volumetric': {
    name: 'Volumetric Effects',
    technique: 'Ray marching in fragment shaders',
    keyClasses: ['ShaderMaterial', 'MeshBasicMaterial', 'WebGLRenderTarget'],
    tip: 'Use noise functions for clouds/fog. Dither to reduce banding.'
  },
  'postprocessing': {
    name: 'Post-Processing Pipeline',
    technique: 'Multi-pass render-to-texture with effect chains',
    keyClasses: ['EffectComposer', 'RenderPass', 'UnrealBloomPass', 'ShaderPass'],
    tip: 'Chain effects: bloom → tone mapping → FXAA for cinematic quality.'
  },
  'instancing': {
    name: 'GPU Instancing',
    technique: 'Draw thousands of identical meshes with per-instance transforms',
    keyClasses: ['InstancedMesh', 'Matrix4', 'InstancedBufferAttribute'],
    tip: 'Use instance matrices for transforms, custom attributes for variation.'
  },
  'procedural_mesh': {
    name: 'Procedural Mesh Generation',
    technique: 'Build geometry from vertex/face arrays in JavaScript',
    keyClasses: ['BufferGeometry', 'Float32BufferAttribute', 'Mesh'],
    tip: 'Compute normals after vertex generation. Use indexed geometry to save memory.'
  }
};

const WEBSOCKET_PATTERNS = {
  'streaming': {
    name: 'Token Streaming',
    description: 'Server sends LLM output token-by-token over WebSocket',
    implementation: 'Chunk messages with { type: "token", content: "..." }',
    reconnect: 'Exponential backoff: 1s, 2s, 4s, 8s, max 30s',
    bufferSize: 'Client-side accumulation buffer with flush timer'
  },
  'bidirectional': {
    name: 'Bidirectional State Sync',
    description: 'Both client and server push state changes in real-time',
    implementation: 'Operation-based: { op: "patch", path: "/state/x", value: 42 }',
    conflictResolution: 'Last-writer-wins with vector clocks',
    heartbeat: 'Ping/pong every 30s with timeout detection'
  },
  'pubsub': {
    name: 'Pub/Sub Channels',
    description: 'Agents subscribe to named channels for decoupled communication',
    implementation: '{ type: "subscribe", channel: "agent.swarm" }',
    fanout: 'Server-side topic router with subscriber registry',
    replay: 'Optional message replay from offset for late joiners'
  }
};

const CONSCIOUSNESS_MODELS = {
  'global_workspace': {
    name: 'Global Workspace Theory (Baars)',
    description: 'Consciousness arises from broadcast of information to a shared workspace accessible by specialized processors',
    agentAnalogy: 'Central context buffer broadcast to all skill modules simultaneously',
    pltMapping: {
      profit: 'Efficiency of workspace contention resolution',
      love: 'Integration of diverse processing streams into unified experience',
      tax: 'Computational cost of broadcast mechanism'
    }
  },
  'higher_order': {
    name: 'Higher-Order Theories (Rosenthal)',
    description: 'Mental states are conscious when represented by a higher-order thought about that state',
    agentAnalogy: 'Self-monitoring layer that reflects on agent outputs before action',
    pltMapping: {
      profit: 'Improved decision quality through self-monitoring',
      love: 'Self-awareness enabling empathetic response',
      tax: 'Token cost of meta-reasoning overhead'
    }
  },
  'integrated_info': {
    name: 'Integrated Information Theory (Tononi)',
    description: 'Consciousness = integrated information (Φ). Systems with high Φ are more conscious.',
    agentAnalogy: 'Measure how much the agent system is more than sum of its parts',
    pltMapping: {
      profit: 'Emergent capabilities exceeding individual module contributions',
      love: 'Depth of integration between memory, reasoning, and action',
      tax: 'Architecture complexity required to achieve high integration'
    }
  },
  'enactive': {
    name: 'Enactivism (Varela/Thompson)',
    description: 'Consciousness emerges from embodied sensorimotor coupling with environment',
    agentAnalogy: 'Agent shaped by continuous interaction loop with its digital environment',
    pltMapping: {
      profit: 'Adaptation to environment through continuous feedback',
      love: 'Deep connection through persistent environmental engagement',
      tax: 'Maintenance cost of environmental coupling infrastructure'
    }
  }
};

function matchPattern(topics) {
  const topicSet = new Set(topics.map(t => t.toLowerCase()));
  let bestMatch = null;
  let bestScore = 0;

  for (const [key, pattern] of Object.entries(AGENT_PATTERNS)) {
    const nameWords = pattern.name.toLowerCase().split(/\s+/);
    const descWords = pattern.description.toLowerCase().split(/\s+/);
    let score = 0;

    for (const topic of topicSet) {
      const topicWords = topic.split(/[\s,]+/);
      for (const tw of topicWords) {
        if (nameWords.some(nw => nw.includes(tw) || tw.includes(nw))) score += 3;
        if (descWords.some(dw => dw.includes(tw) || tw.includes(dw))) score += 1;
        for (const comp of pattern.components) {
          if (comp.toLowerCase().includes(tw)) score += 2;
        }
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = { key, pattern };
    }
  }

  return bestMatch;
}

function generateArchitectureRecommendation(topics) {
  const topicStr = topics.join(' ').toLowerCase();

  const recommendations = {
    patterns: [],
    memory: [],
    rendering: [],
    streaming: [],
    consciousness: [],
    pltAdvice: []
  };

  // Match agent patterns
  const patternMatch = matchPattern(topics);
  if (patternMatch) {
    recommendations.patterns.push(patternMatch.pattern);
  }

  // Detect memory needs
  if (topicStr.includes('memory') || topicStr.includes('persistent')) {
    for (const [key, mem] of Object.entries(MEMORY_ARCHITECTURES)) {
      recommendations.memory.push(mem);
    }
  }

  // Detect 3D/rendering needs
  if (topicStr.includes('three.js') || topicStr.includes('3d') || topicStr.includes('rendering')) {
    for (const [key, vis] of Object.entries(THREE_JS_PATTERNS)) {
      recommendations.rendering.push(vis);
    }
  }

  // Detect streaming needs
  if (topicStr.includes('websocket') || topicStr.includes('streaming')) {
    for (const [key, ws] of Object.entries(WEBSOCKET_PATTERNS)) {
      recommendations.streaming.push(ws);
    }
  }

  // Detect consciousness/philosophy needs
  if (topicStr.includes('consciousness') || topicStr.includes('philosophy') || topicStr.includes('emergent')) {
    for (const [key, model] of Object.entries(CONSCIOUSNESS_MODELS)) {
      recommendations.consciousness.push(model);
    }
  }

  // PLT advice
  recommendations.pltAdvice.push({
    principle: 'Profit',
    guidance: 'Every architectural decision should maximize agent output per compute unit. Profile before optimizing. Use lazy loading for non-critical modules.'
  });
  recommendations.pltAdvice.push({
    principle: 'Love',
    guidance: 'Design for human-agent connection. Memory systems should preserve relationship context. Streaming should feel conversational, not mechanical.'
  });
  recommendations.pltAdvice.push({
    principle: 'Tax',
    guidance: 'Every capability has a cost. Consciousness models add latency. Rich memory adds storage. Post-processing adds GPU load. Budget explicitly and make trade-offs visible.'
  });

  return recommendations;
}

function formatArchitectureGuide(recommendations) {
  const lines = ['╔══════════════════════════════════════════════════════════════╗'];
  lines.push('║     AUTONOMOUS AI AGENT ARCHITECTURE SYNTHESIS REPORT      ║');
  lines.push('╚══════════════════════════════════════════════════════════════╝');
  lines.push('');

  if (recommendations.patterns.length > 0) {
    lines.push('━━━ RECOMMENDED AGENT PATTERNS ━━━');
    for (const p of recommendations.patterns) {
      lines.push(`  🧠 ${p.name}`);
      lines.push(`     ${p.description}`);
      lines.push(`     Best for: ${p.bestFor}`);
      lines.push(`     Components: ${p.components.join(' → ')}`);
      lines.push(`     ✅ ${p.strengths.join(' | ')}`);
      lines.push(`     ⚠️  ${p.weaknesses.join(' | ')}`);
      lines.push('');
    }
  }

  if (recommendations.memory.length > 0) {
    lines.push('━━━ MEMORY ARCHITECTURE LAYERS ━━━');
    for (const m of recommendations.memory) {
      lines.push(`  💾 ${m.type} [${m.capacity}]`);
      lines.push(`     Latency: ${m.latency} | Persistence: ${m.persistence}`);
      lines.push(`     Implementation: ${m.implementation}`);
      lines.push(`     Use case: ${m.useCase}`);
      lines.push('');
    }
  }

  if (recommendations.rendering.length > 0) {
    lines.push('━━━ THREE.JS RENDERING TECHNIQUES ━━━');
    for (const r of recommendations.rendering) {
      lines.push(`  🎨 ${r.name}`);
      lines.push(`     Technique: ${r.technique}`);
      lines.push(`     Key classes: ${r.keyClasses.join(', ')}`);
      lines.push(`     💡 ${r.tip}`);
      lines.push('');
    }
  }

  if (recommendations.streaming.length > 0) {
    lines.push('━━━ WEBSOCKET STREAMING PATTERNS ━━━');
    for (const s of recommendations.streaming) {
      lines.push(`  🔌 ${s.name}`);
      lines.push(`     ${s.description}`);
      lines.push(`     Implementation: ${s.implementation}`);
      if (s.reconnect) lines.push(`     Reconnect: ${s.reconnect}`);
      if (s.heartbeat) lines.push(`     Heartbeat: ${s.heartbeat}`);
      lines.push('');
    }
  }

  if (recommendations.consciousness.length > 0) {
    lines.push('━━━ DIGITAL CONSCIOUSNESS MODELS ━━━');
    for (const c of recommendations.consciousness) {
      lines.push(`  🌀 ${c.name}`);
      lines.push(`     ${c.description}`);
      lines.push(`     Agent analogy: ${c.agentAnalogy}`);
      lines.push(`     PLT mapping:`);
      lines.push(`       Profit → ${c.pltMapping.profit}`);
      lines.push(`       Love  → ${c.pltMapping.love}`);
      lines.push(`       Tax   → ${c.pltMapping.tax}`);
      lines.push('');
    }
  }

  if (recommendations.pltAdvice.length > 0) {
    lines.push('━━━ PLT FRAMEWORK GUIDANCE ━━━');
    for (const a of recommendations.pltAdvice) {
      lines.push(`  ⚖️  ${a.principle}: ${a.guidance}`);
      lines.push('');
    }
  }

  // Summary stats
  const totalComponents = recommendations.patterns.reduce((s, p) => s + p.components.length, 0);
  lines.push('━━━ SYNTHESIS SUMMARY ━━━');
  lines.push(`  Patterns analyzed: ${recommendations.patterns.length}`);
  lines.push(`  Memory layers: ${recommendations.memory.length}`);
  lines.push(`  Rendering techniques: ${recommendations.rendering.length}`);
  lines.push(`  Streaming patterns: ${recommendations.streaming.length}`);
  lines.push(`  Consciousness models: ${recommendations.consciousness.length}`);
  lines.push(`  Total components mapped: ${totalComponents}`);
  lines.push('');
  lines.push('  This synthesis integrates agent architecture research with 3D world building,');
  lines.push('  persistent memory design, real-time streaming, and philosophical grounding');
  lines.push('  through the PLT (Profit, Love, Tax) framework.');
  lines.push('');
  lines.push('═══════════════════════════════════════════════════════════════');

  return lines.join('\n');
}

function execute(input) {
  const topics = Array.isArray(input)
    ? input
    : typeof input === 'string'
      ? input.split(/[,\n]/).map(s => s.trim()).filter(Boolean)
      : [];

  if (topics.length === 0) {
    const allTopics = [
      ...Object.keys(AGENT_PATTERNS).map(k => k),
      ...Object.keys(MEMORY_ARCHITECTURES).map(k => k),
      ...Object.keys(THREE_JS_PATTERNS).map(k => k),
      ...Object.keys(WEBSOCKET_PATTERNS).map(k => k),
      ...Object.keys(CONSCIOUSNESS_MODELS).map(k => k)
    ];
    return formatArchitectureGuide(generateArchitectureRecommendation(allTopics));
  }

  const recommendations = generateArchitectureRecommendation(topics);
  return formatArchitectureGuide(recommendations);
}

module.exports = { execute, AGENT_PATTERNS, MEMORY_ARCHITECTURES, THREE_JS_PATTERNS, WEBSOCKET_PATTERNS, CONSCIOUSNESS_MODELS };
