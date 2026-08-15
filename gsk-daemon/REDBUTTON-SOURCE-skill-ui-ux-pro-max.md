# REDBUTTON Source: UI UX Pro Max Skill Architecture

- Source URL: `https://github.com/nextlevelbuilder/ui-ux-pro-max-skill`
- Stars: 98.8k
- Type: AI Skill / Design knowledge base
- REDBUTTON classification: body donor, knowledge architecture pattern

## What It Is

An AI skill that provides design intelligence for building professional UI/UX across multiple platforms. ~99k stars, 10k forks. Supports Claude, Cursor, Windsurf, Copilot, Codex CLI, and 15+ other AI assistants.

## Architecture Pattern Worth Stealing

### 1. Knowledge Base Structure

The skill organizes knowledge into structured CSV databases + Python search scripts + platform-specific templates.

```
data/*.csv           → Structured knowledge (styles, colors, typography, patterns)
scripts/search.py    → BM25 search + reasoning engine
templates/           → Platform-specific file templates
```

This is a clean pattern for the Memory Compiler's knowledge layer.

### 2. Hierarchical Retrieval (Master + Override)

```
design-system/
├── MASTER.md           # Global Source of Truth
└── pages/
    └── dashboard.md    # Page-specific overrides (only deviations from Master)
```

**Rule**: Check page file first. If exists, override Master. If not, use Master exclusively.

This is exactly the memory retrieval pattern REDBUTTON needs:
- Core identity (Master) + context-specific overrides
- Layer fallback: check specific first, fall back to general

### 3. Multi-Domain Parallel Search

The design system generator runs **5 parallel searches** then combines results through a reasoning engine:

1. Product type matching (161 categories)
2. Style recommendations (67 styles)
3. Color palette selection (161 palettes)
4. Landing page patterns (24 patterns)
5. Typography pairing (57 font combinations)

Then a **reasoning engine** combines and ranks results.

This maps to the Memory Compiler's multi-signal retrieval concept:
- query facts, lessons, episodes, relationships, identity simultaneously
- fuse results through a ranking layer

### 4. Cross-Platform Installer Pattern

A single CLI (`uipro init --ai <platform>`) installs the skill for any AI assistant. This is the body abstraction pattern REDBUTTON recommends.

### 5. 161 Reasoning Rules As Constitutional Knowledge

The repo encodes domain knowledge as structured rules with:
- Recommended Pattern
- Style Priority
- Color Mood
- Typography Mood
- Anti-Patterns (what NOT to do)

This is exactly the Lesson/Policy memory class format: rules with context, conditions, and prohibitions.

## What Not To Steal

- The UI/UX content itself (not relevant to memory architecture)
- The Python-specific implementation (should be adapted to JS/Node)
- The marketplace/plugin dependency (keep it self-contained)

## Graft Guidance

1. **Knowledge base structure**: adopt CSV/JSON structured data + search scripts for the Memory Compiler's fact/lesson stores
2. **Hierarchical retrieval**: implement the Master + Override pattern for memory layers
3. **Multi-domain parallel search**: use for multi-signal retrieval across memory classes
4. **Anti-patterns as governance rules**: encode what NOT to do as first-class constitutional knowledge
5. **CLI installer pattern**: if GSK needs to install skills across bodies, this is the pattern

## One-Sentence Takeaway

The UI UX Pro Max skill demonstrates a clean knowledge architecture pattern — structured databases, hierarchical retrieval, multi-domain search, and anti-pattern encoding — that should influence the Memory Compiler's design.
