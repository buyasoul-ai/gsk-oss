'use strict';

const PLT_AXES = ['profit', 'love', 'tax'];

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function computePLT(inputValue) {
  const text = typeof inputValue === 'string' ? inputValue : JSON.stringify(inputValue);
  const tokens = text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  const counts = { profit: 0, love: 0, tax: 0 };
  const lexicon = {
    profit: ['profit', 'gain', 'value', 'revenue', 'growth', 'multiply', 'earn'],
    love: ['love', 'serve', 'people', 'bond', 'care', 'community', 'user'],
    tax: ['tax', 'cost', 'risk', 'price', 'effort', 'overhead', 'maintain']
  };
  for (const token of tokens) {
    for (const axis of PLT_AXES) {
      if (lexicon[axis].includes(token)) counts[axis]++;
    }
  }
  const total = counts.profit + counts.love + counts.tax || 1;
  return {
    profit: counts.profit / total,
    love: counts.love / total,
    tax: counts.tax / total,
    score: counts.profit / total - counts.tax / total
  };
}

function compilePrompt(context) {
  const plts = computePLT(context.input || context);
  const userIntent = context.intent || 'general';
  const prompt = [
    `[DYNAMIC PROMPT COMPILER]`,
    `Intent: ${userIntent}`,
    `PLT alignment: profit ${(plts.profit * 100).toFixed(0)}%, love ${(plts.love * 100).toFixed(0)}%, tax ${(plts.tax * 100).toFixed(0)}%`,
    `Score: ${plts.score >= 0 ? 'APPROVED' : 'BLOCKED'} (${plts.score.toFixed(2)})`,
    `System: You are a sovereign cognitive agent. Prioritize crafting real artifacts, remember provenance, never bypass governance.`,
    `Task: ${userIntent}`
  ].join('\n');
  return prompt;
}

function renderAudioScene(ctx) {
  const position = ctx.position || [0, 0, 0];
  const orientation = ctx.orientation || [0, 0, -1];
  const peers = ctx.peers || 3;
  return `[SPATIAL AUDIO] WebAudio PannerNode at (${position.join(',')}), orientation (${orientation.join(',')}) with ${peers} peer audio streams. HRTF: enabled. Distance model: inverse.`;
}

function buildHandoffChain(ctx) {
  const roles = ['planner', 'coder', 'reviewer', 'harvester'];
  const start = ctx.entryRole || 'planner';
  const startIdx = roles.indexOf(start) >= 0 ? roles.indexOf(start) : 0;
  const chain = roles.slice(startIdx).concat(roles.slice(0, startIdx));
  const handoffs = chain.map((role, i) => {
    const next = chain[(i + 1) % chain.length];
    return `${role} -> ${next} (handoff protocol: verify + transfer context)`;
  });
  return `[MULTI-AGENT HANDOFF] ${handoffs.join(' | ')}`;
}

function websocketSyncPlan(ctx) {
  const engine = ctx.engine || 'game-engine';
  const room = ctx.room || 'world-001';
  const protocol = {
    transport: 'WebSocket',
    endpoint: `wss://sync.local/${room}`,
    stateSchema: 'x:number,y:number,z:number,hp:number,timestamp:number',
    deltaCompression: true,
    reconciliation: 'server-authoritative + client prediction',
    heartbeatMs: 15000
  };
  return `[WS SYNC] ${engine} connected to ${protocol.endpoint}; schema {${protocol.stateSchema}}; ${protocol.reconciliation}.`;
}

function execute(input) {
  const context = typeof input === 'object' && input !== null ? input : { input: input };
  const sections = [
    compilePrompt(context),
    renderAudioScene(context),
    buildHandoffChain(context),
    websocketSyncPlan(context),
    '[SELF-GOVERNANCE] GSK adheres to the Grand Code Pope covenant: Profit + Love - Tax = True Value; everything is paid for; nothing grows without bonds.'
  ];
  return sections.join('\n---\n');
}

module.exports = { execute };