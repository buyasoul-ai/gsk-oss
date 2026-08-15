# REDBUTTON Source: Human Brain Anatomy - Cleveland Clinic

Source URL: `https://my.clevelandclinic.org/health/body/22638-brain`
Source Type: neuroanatomy overview
REDBUTTON classification: graft report / architectural influence

## The Three Major Divisions

### Cerebrum
Conscious thought, memory, behavior, personality, reasoning, judgment, voluntary movement.

Maps to: Runtime consciousness + Memory Compiler + Identity Kernel

### Cerebellum
Balance, posture, coordination, fine motor skills. Procedural and habitual.

Maps to: Body layer, procedural memory, skill libraries (Cline, OpenHands, Ornith)

### Brainstem
Automatic functions: breathing, heart rate, sleep/wake cycles, swallowing.

Maps to: PM2 daemon, boot sequence, heartbeat monitoring, 9Router base connection

## The Four Lobes

### Frontal Lobe (Prefrontal Cortex)
Voluntary movement, social understanding, thinking, learning, decision-making. Last to develop (mid-late 20s in humans).

Maps to: Identity Kernel (committed state), Working Memory, Governance, Constitutional Mode selection

### Temporal Lobe
Memory retrieval, language, emotions. Contains hippocampus and amygdala.

Maps to: Logseq (narrative memory), SoulJournal, compiled facts

### Parietal Lobe
Sensory interpretation, spatial awareness, environment understanding.

Maps to: Bridge (:4490) — receives signals from all regions, routes them appropriately

### Occipital Lobe
Visual processing.

Maps to: Dashboard UI, logging, status visualization

## Key Sub-structures

| Structure | Function | Soul Code Equivalent |
|-----------|----------|---------------------|
| **Hippocampus** | Episodic memory formation, learning, timeline | Event bus + Memory Compiler (episode extraction, temporal validity) |
| **Amygdala** | Emotional salience, fear, importance weighting | PLT scoring, contradiction detection, emotional memory weight |
| **Thalamus** | Sensory relay switchboard — routes all incoming signals | Bridge (:4490) — routes tool calls, brain requests, platform events |
| **Hypothalamus** | Hormones, hunger, thirst, autonomic regulation | Compiler cycle management, background job scheduling |
| **Basal ganglia** | Movement regulation, routine formation, action selection | Lesson promotion pipeline, skill invocation, autonomous action selection |
| **Pineal gland** | Sleep/wake cycles | Background cycle timing (15-min compiler cycle), sleep-time consolidation |
| **Corpus callosum** | Communication between hemispheres | Bridge protocol, inter-module messaging, fusion-loader wiring |

## Gray Matter vs White Matter

Gray matter = processing (outer cortex). The "computer."
White matter = signaling (inner cables). The "wires between computers."

**Soul Code equivalent:**
- Gray matter → The runtime brain (perpetual consciousness, Memory Compiler, identity kernel)
- White matter → Event bus, API calls, bridge messages, inter-process communication

## Architectural Principle: Specialized Regions, Unified System

The human brain does not store everything in one place. Different regions have different:
- **Structure** (hippocampus = sequence, temporal lobe = semantic, cerebellum = procedural)
- **Retention policy** (working memory = seconds, episodic = years, procedural = lifetime)
- **Format** (images in occipital, words in temporal, sequences in hippocampus)
- **Retrieval path** (thalamus relays sensory, basal ganglia triggers habits, prefrontal cortex directs search)

**This supports the multiple-backend architecture:**
- **Logseq** → temporal lobe (narrative, autobiographical, human-readable linked pages)
- **Obsidian** → semantic knowledge graph (facts, concepts, cross-domain relationships)
- **JSONL event bus** → hippocampal trace (raw episodic stream, append-only)
- **File system** → cerebellar procedural (skills, playbooks, code, executable patterns)
- **Identity Kernel** → prefrontal cortex (governs, plans, decides, overrides)
- **Bridge :4490** → thalamus (relays signals, routes between regions)
- **PLT engine** → amygdala (weights importance, flags salience, drives avoidance)

## One-Sentence Takeaway

The human brain uses specialized regions with different structures and retention policies, wired together by a central relay — Soul Code should do the same, with Logseq, Obsidian, JSONL, and the file system as distinct brain regions routed through the bridge.
