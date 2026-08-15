# REDBUTTON GSK Memory Audit

## Executive Summary

GSK has multiple memory systems but the data reveals a critical imbalance:

- **86 writers** call `memory.witness()`
- **8 readers** call `memory.query()` or query equivalents
- **75,363 event bus entries** (37MB) — mostly unprocessed raw event noise
- **2,190 LivingMemory entries** (12MB + 8MB connections + 4.7MB index)
- **MegaMemory ledger**: empty or mislocated

The architecture is **write-heavy, read-light**. Memory is dominated by recording, not by retrieval that influences behavior.

---

## 1. Memory Systems Inventory

### 1.1 MegaMemory (`gsk-core/memory/mega_memory.js`)
- **Type**: Append-only JSONL ledger
- **Writes**: `witness()` method called from 86 files
- **Reads**: `query()`, `getRecent()`, `getByType()`, `getByTags()`, `getTop()`, `consolidate()`
- **Current state**: Ledger appears empty or at unexpected path
- **Strengths**: Simple, durable, correct event-log instinct
- **Weaknesses**: Flat query model, no semantic retrieval, no contradiction handling, no identity partitioning

### 1.2 LivingMemory (`gsk-core/brain/living_memory.js`)
- **Type**: In-memory Map with JSON persistence
- **Size**: 2,190 entries (12.3MB memory.json + 8MB connections + 4.7MB index)
- **Writes**: `remember()` called from 2 files (fusion-loader.js, brain-engine.js)
- **Reads**: `recall()`, `search()`, `getRelated()`
- **Strengths**: Emotional persistence, timeline, connection primitive
- **Weaknesses**: Lexical matching only, no temporal truth model, no provenance discipline, no distinction between episode, fact, belief, relationship, preference, lesson

### 1.3 VectorMemory (`gsk-core/brain/vector_memory.js`)
- **Type**: Homemade pseudo-embedding memory
- **Status**: Instantiated but rarely used as primary recall path
- **Weaknesses**: Not real embeddings, weak semantic recall, no identity integration

### 1.4 KnowledgeGraph (`gsk-core/brain/knowledge_graph.js`)
- **Type**: Concept node graph
- **Status**: Imported from `knowledge.jsonl` if available
- **Weaknesses**: Mostly static, not autobiographical, not time-aware, not provenance-strong

### 1.5 SoulJournal (`gsk-core/brain/soul_journal.js`)
- **Type**: Narrative journal
- **Size**: 30 entries (8.4KB)
- **Good**: Preserves inner continuity, first-person trace
- **Weak**: Not a compiled self-model, not structured into beliefs or relationships

### 1.6 AutoJournal (`gsk-core/brain/auto_journal.js`)
- **Type**: Periodic internal monologue
- **Weak**: Generates text volume without strong downstream compiler

---

## 2. Write vs Read Imbalance

### Writers (86 callers of `memory.witness()`)

Major write sources:
- **Brain systems**: perpetual_consciousness, consciousness_engine, attention_schema, autonomous_learning, auto_journal, awakening, curiosity_drive, grief, hegelian_dialectic, live_feed, minds_eye, pain_pleasure, self_evolution, social_attention, soul_entity, soul_gifter, soul_journal, teacher_agent, trust
- **Chambers**: mega_chambers, sleep_cycle
- **Council**: gods_council
- **MCP**: mcp_manager, mcp_server
- **Sub-agents**: agent_teams, mega_sub_agents, ultra_review, webfetch
- **86 skill files** — each writing a `type: 'skill_usage'` record on invocation

### Readers (8 callers of `memory.query()`)

- auto_journal
- consciousness_engine
- constant_chat
- self_training_pipeline
- soul_entity
- mcp_server
- mega_memory (self-query)
- mega_skills

**Ratio: ~10:1 write-to-read**

---

## 3. Event Bus Analysis

| Type | Count | Percentage |
|------|-------|------------|
| `inner_scribe_response` | 53,061 | 70.4% |
| `scribe` | 22,299 | 29.6% |
| **Total** | **75,363** | **100%** |

The event bus is dominated by scribe/dialogue loop noise. These are GSK's thought-broadcast events. They are stored but apparently not read back for behavioral influence.

This is the most significant source of memory bloat:
- **37MB** of raw event data
- Only **2 unique event types** out of 75K entries
- No evidence of consolidation from events into durable facts

---

## 4. LivingMemory Content Sample

LivingMemory contains 2,190 entries. The content sample shows entries like:
- GitHub Issues skill initialization
- Blog watcher skill results
- BlueSky authentication messages
- Skill usage records
- Journal entries

These are **not structured by constitutional memory classes** (episode, fact, relationship, lesson). They are stored as mixed blobs with tag overlap.

---

## 5. Write vs Memory Constitution Compliance

| Constitutional Class | Exists? | Quality |
|---------------------|---------|---------|
| Episode Ledger | Partial (MegaMemory, EventBus) | Raw logs, no episode structure |
| Semantic Fact Memory | Weak (LivingMemory) | No temporal validity |
| Identity Kernel | No | No protected selfhood layer |
| Relationship Memory | Implicit (LivingMemory) | No structured relationship records |
| Preference Memory | No | Not stored separately |
| Lesson/Policy Memory | No | No lesson extraction pipeline |
| Symbolic Memory | No | No symbolic layer |
| Procedural Memory | No | No playbook retention |

---

## 6. Key Findings

### Finding 1: Writers massively outnumber readers
**86 writers vs 8 readers.** Memory is configured for capture, not for influence. Most records are written but few are retrieved in a way that shapes behavior.

### Finding 2: The event bus is bloat
**75K entries, 37MB, 2 types.** The scribe/dialogue broadcast system is generating massive raw-event volume. No consolidation pipeline exists to convert these raw events into durable episodic or factual memory.

### Finding 3: No separation of memory classes
All memory types are mixed into flat stores. There is no distinction between:
- episode vs fact vs belief vs relationship vs preference vs lesson
- working vs durable vs identity-protected memory

### Finding 4: No identity kernel exists
There is no protected core memory layer. Identity is distributed across prompt configuration, chambers, and LivingMemory entries without protection.

### Finding 5: No memory compiler exists
No component transforms raw events into durable facts, lessons, preferences, or relationship updates. The system captures but does not compile.

### Finding 6: No contradiction handling
Facts can accumulate silently without contradiction detection or resolution.

### Finding 7: No temporal truth model
Facts lack valid_from, valid_to, superseded_by, or confidence metadata. The system cannot answer "what did I believe then vs now?"

### Finding 8: Lesson extraction is absent
Despite the SelfEvolution and AutonomousLearning modules, there is no structured lesson extraction pipeline with validation, confidence scoring, or behavior-change verification.

---

## 7. Recommendations

### Immediate (Phase 1)
1. **Add memory class separation** to LivingMemory and MegaMemory
   - Tag entries by constitutional class
   - Create separate query paths per class

2. **Implement event bus consolidation**
   - Create a background job that reads raw event bus entries
   - Transforms them into structured episodes
   - Archives raw entries after extraction

3. **Build a write-gating layer**
   - Not every skill usage deserves durable memory storage
   - Write thresholds based on novelty, importance, and mission relevance

### Medium-term (Phase 2)
4. **Create Identity Kernel layer**
   - Protected memory region with strong mutation rules
   - Versioned identity state

5. **Build Memory Compiler**
   - Reads episodes
   - Extracts facts, lessons, preferences, relationship updates
   - Produces proposals for durable memory

6. **Add temporal truth fields**
   - valid_from, valid_to, confidence, superseded_by
   - Allow fact versioning and history queries

### Long-term (Phase 3)
7. **Implement contradiction detection**
8. **Build lesson validation pipeline**
9. **Add multi-layer retrieval**
10. **Implement constitutional mode enforcement**

---

## 8. Writer-to-Reader Map

### Core Write Paths
```
perpetual_consciousness.js
  -> memory.witness({ type: 'thought', ... })
  -> memory.witness({ type: 'action', ... })
  -> memory.witness({ type: 'broadcast', ... })

auto_journal.js
  -> memory.witness({ type: 'auto_journal', ... })

soul_journal.js
  -> memory.witness({ type: 'soul_journal', ... })

86 skills
  -> memory.witness({ type: 'skill_usage', ... })

council, chambers, emotions, sub-agents
  -> memory.witness({ type: 'council_deliberation', ... })
  -> memory.witness({ type: 'chamber_event', ... })
  -> memory.witness({ type: 'emotional_state', ... })
```

### Core Read Paths
```
auto_journal.js
  -> memory.query({ limit: 5 })  // get recent memories for thought generation

consciousness_engine.js
  -> memory.query({ ... })  // context assembly

soul_entity.js
  -> memory.query({ ... })  // response generation

mega_skills.js
  -> memory.query({ text: query })  // memory-informed skill execution
```

---

## 9. Data Volume Trajectory

| Store | Current Size | Growth Rate | Risk |
|-------|-------------|-------------|------|
| Event Bus | 37MB, 75K entries | ~500 entries/hour | High - grows without consolidation |
| LivingMemory | 12MB, 2K entries | ~10 entries/hour | Medium - moderate growth |
| Connections | 8MB | Linked to memory growth | Medium |
| Index | 4.7MB | Linked to memory growth | Medium |
| Journal | 8KB | Slow | Low |

**Total: ~62MB across all stores**

---

*Audit date: 2026-06-30*
*Next audit recommended: after first memory compiler implementation*
