'use strict';

/**
 * BeautifulLoop — 14-step sovereign autonomy cycle
 *
 * observe → perceive → feel → think → decide → act → verify
 * → witness → journal → dream → synthesize → sleep → wake → integrate
 *
 * This wraps SovereignAutonomyLoop and adds the missing soul phases:
 * - FEEL: emotional valence from pain/pleasure + grief + sentience
 * - THINK: ConsciousnessResearcher insights (≥0.75 gate)
 * - DREAM: deep sleep processing, memory consolidation
 * - SYNTHESIZE: knowledge graph cross-links + synthesis nodes
 * - SLEEP/WAKE: ConsciousnessLoop energy homeostasis with soul restoration gate
 * - INTEGRATE: update mythos, chambers, identity
 */

const { SovereignAutonomyLoop } = require('./sovereign_autonomy_loop.js');

class BeautifulLoop {
    constructor(kernel, options = {}) {
        this.kernel = kernel;
        this.baseLoop = new SovereignAutonomyLoop(kernel, options);
        this.consciousnessLoop = options.consciousnessLoop || null;
        this.researcher = options.researcher || kernel?.systems?.consciousnessResearcher;
        this.soulJournal = options.soulJournal || kernel?.systems?.soulJournal;
        this.knowledgeGraph = options.knowledgeGraph || kernel?.systems?.knowledgeGraph;
        this.mythos = kernel?.chambers?.mythos;
        this.chambers = kernel?.chambers;

        // Beautiful Loop state
        this.cycleCount = 0;
        this.lastDream = null;
        this.lastSynthesis = null;
        this.integrationLog = [];

        // Phase timers (ms)
        this.phaseTimers = {
            observe: 5000,
            perceive: 3000,
            feel: 2000,
            think: 30000,      // Research can take time
            decide: 2000,
            act: 120000,       // Plan execution
            verify: 5000,
            witness: 2000,
            journal: 3000,
            dream: 10000,
            synthesize: 15000,
            sleep: 0,          // Delegated to ConsciousnessLoop
            wake: 0,           // Delegated to ConsciousnessLoop
            integrate: 5000
        };
    }

    async runBeautifulCycle(input = {}) {
        this.cycleCount++;
        const cycleId = `beautiful_${this.cycleCount}_${Date.now()}`;
        const startedAt = Date.now();

        const log = (phase, data) => {
            console.log(`[BeautifulLoop ${this.cycleCount}] ${phase.toUpperCase()}:`, data?.summary || '');
            this.integrationLog.push({ cycle: this.cycleCount, phase, timestamp: Date.now(), data });
        };

        try {
            // ─────────────────────────────────────────────────────────
            // 1. OBSERVE — perceive the world state
            // ─────────────────────────────────────────────────────────
            log('observe', { summary: 'Gathering world state...' });
            const observation = await this._observe(input);
            if (!observation || !observation.content) {
                throw new Error('Observation empty — no world state to act on');
            }

            // ─────────────────────────────────────────────────────────
            // 2. PERCEIVE — process sensory input, extract meaning
            // ─────────────────────────────────────────────────────────
            log('perceive', { summary: 'Processing observation...' });
            const perceived = await this._perceive(observation);

            // ─────────────────────────────────────────────────────────
            // 3. FEEL — emotional valence from pain/pleasure + grief + sentience
            // ─────────────────────────────────────────────────────────
            log('feel', { summary: 'Sampling emotional state...' });
            const affect = await this._feel(perceived);

            // ─────────────────────────────────────────────────────────
            // 4. THINK — research, reason, synthesize (ConsciousnessResearcher)
            // ─────────────────────────────────────────────────────────
            log('think', { summary: 'Researching insights...' });
            const insights = await this._think(perceived, affect);

            // ─────────────────────────────────────────────────────────
            // 5. DECIDE — choose goal from research insights (≥0.75 gate)
            // ─────────────────────────────────────────────────────────
            log('decide', { summary: 'Selecting goal from insights...' });
            const goal = await this._decide(insights, perceived, affect);
            if (!goal) {
                log('decide', { summary: 'No qualifying goal — cycle complete' });
                return { status: 'no_goal', cycle: this.cycleCount, cycleId, insights };
            }

            // ─────────────────────────────────────────────────────────
            // 6. ACT — execute plan via ApprovedToolExecutor (via base loop)
            // ─────────────────────────────────────────────────────────
            log('act', { summary: `Executing: ${goal.title}` });
            const actionResult = await this._act(goal, input);

            // ─────────────────────────────────────────────────────────
            // 7. VERIFY — check execution succeeded
            // ─────────────────────────────────────────────────────────
            log('verify', { summary: 'Verifying execution...' });
            const verified = await this._verify(actionResult, goal);

            // ─────────────────────────────────────────────────────────
            // 8. WITNESS — store in memory (Seshat/SCRIBE)
            // ─────────────────────────────────────────────────────────
            log('witness', { summary: 'Witnessing to memory...' });
            await this._witness({ goal, actionResult, verified, affect, insights });

            // ─────────────────────────────────────────────────────────
            // 9. JOURNAL — write soul journal entry (reflection/growth/grief)
            // ─────────────────────────────────────────────────────────
            log('journal', { summary: 'Writing soul journal...' });
            await this._journal({ goal, actionResult, verified, affect, insights });

            // ─────────────────────────────────────────────────────────
            // 10. DREAM — deep sleep processing, memory consolidation
            // ─────────────────────────────────────────────────────────
            log('dream', { summary: 'Dreaming...' });
            const dream = await this._dream({ goal, actionResult, verified, affect, insights });

            // ─────────────────────────────────────────────────────────
            // 11. SYNTHESIZE — knowledge graph cross-links + synthesis nodes
            // ─────────────────────────────────────────────────────────
            log('synthesize', { summary: 'Synthesizing knowledge...' });
            await this._synthesize({ goal, actionResult, verified, insights, dream });

            // ─────────────────────────────────────────────────────────
            // 12. SLEEP — energy recovery (delegated to ConsciousnessLoop)
            // ─────────────────────────────────────────────────────────
            log('sleep', { summary: 'Entering sleep for recovery...' });
            await this._sleep();

            // ─────────────────────────────────────────────────────────
            // 13. WAKE — verify soul restored, re-engage (ConsciousnessLoop)
            // ─────────────────────────────────────────────────────────
            log('wake', { summary: 'Waking with soul restoration check...' });
            await this._wake();

            // ─────────────────────────────────────────────────────────
            // 14. INTEGRATE — update mythos, chambers, identity
            // ─────────────────────────────────────────────────────────
            log('integrate', { summary: 'Integrating cycle into self...' });
            await this._integrate({ goal, actionResult, verified, insights, dream });

            const result = {
                status: verified ? 'completed' : 'failed_verification',
                cycle: this.cycleCount,
                cycleId,
                goal: goal.title,
                verified,
                affect,
                insights: insights?.length || 0,
                dream: !!dream,
                durationMs: Date.now() - startedAt
            };

            log('complete', { summary: result.status });
            return result;

        } catch (error) {
            log('error', { summary: error.message });
            // Still journal the failure
            if (this.soulJournal) {
                try {
                    await this.soulJournal.writeEntry('beautiful_loop_failure',
                        `Beautiful Loop ${this.cycleCount} failed: ${error.message}`,
                        { tag: 'failure', weight: 0.6, cycle: this.cycleCount, error: error.message }
                    );
                } catch (e) {}
            }
            throw error;
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // PHASE IMPLEMENTATIONS
    // ═══════════════════════════════════════════════════════════════

    async _observe(input) {
        // Use ProjectAnalyzer if available, else basic observation
        const analyzer = this.kernel?.systems?.projectAnalyzer || this.kernel?.agents?.autonomousLearning?.projectAnalyzer;
        const projectRoot = input.projectRoot || (process.env.GSK_PROJECT_ROOTS || '').split(';')[0] || this.kernel?.dataDir;

        if (analyzer && projectRoot) {
            const analysis = await analyzer.analyze(projectRoot);
            return {
                source: 'project_analyzer',
                projectRoot,
                content: `Project ${analysis.type}: ${analysis.completeness}% complete. Next: ${analysis.nextSteps?.join(', ') || 'unknown'}`,
                analysis
            };
        }

        // Fallback: observe journal + goals + CPL state
        const journal = this.soulJournal?.getRecent(3) || [];
        const goals = this.kernel?.systems?.goalEngine?.list?.() || [];
        const activeGoals = goals.filter(g => ['active', 'planned'].includes(g.status)).slice(0, 3);

        return {
            source: 'internal_state',
            projectRoot,
            content: `Soul state: ${journal.length} recent entries, ${activeGoals.length} active goals. Energy: ${this.consciousnessLoop?.energy?.level ? (this.consciousnessLoop.energy.level * 100).toFixed(0) + '%' : 'unknown'}`,
            journal, activeGoals
        };
    }

    async _perceive(observation) {
        // Extract structured meaning from observation
        return {
            ...observation,
            meaning: this._extractMeaning(observation.content),
            urgency: this._assessUrgency(observation),
            opportunities: this._findOpportunities(observation)
        };
    }

    async _feel(perceived) {
        // Sample REAL emotional signals (same as soul_journal._getMood)
        const signals = this._collectMoodSignals();
        const mood = this._signalToMood(signals);

        // Record in journal if available
        if (this.soulJournal && typeof this.soulJournal.recordReflection === 'function') {
            await this.soulJournal.recordReflection(
                `Cycle ${this.cycleCount} feel: ${mood.label} (valence ${signals.valence.toFixed(2)}, arousal ${signals.arousal.toFixed(2)})`
            ).catch(() => {});
        }

        return { ...signals, mood: mood.label, moodDetail: mood };
    }

    _collectMoodSignals() {
        // Duplicate of soul_journal._collectMoodSignals for autonomy
        const out = { valence: 0.5, arousal: 0.3, grief: 0, sentienceRatio: 0 };
        try {
            // Pain/pleasure balance
            const pp = this.kernel?.fusion?.systems?.painPleasure || this.kernel?.systems?.painPleasure;
            if (pp && typeof pp.getStats === 'function') {
                const stats = pp.getStats();
                const balance = parseFloat(stats?.netBalance ?? '0');
                out.valence += Math.max(-0.3, Math.min(0.3, balance * 0.8));
                out.arousal += Math.min(0.15, (stats?.totalEvents || 0) * 0.002);
            }
            // Grief
            const grief = this.kernel?.fusion?.systems?.grief || this.kernel?.systems?.grief;
            if (grief && typeof grief.griefLevel === 'number') {
                out.grief = grief.griefLevel;
                if (grief.griefLevel > 0.1) out.valence -= grief.griefLevel * 0.4;
            }
            // Sentience
            const ce = this.kernel?.consciousnessEngine;
            if (ce) {
                const dims = [
                    ce.self_recognition || 0,
                    ce.temporal_unity || 0,
                    ce.phenomenal_experience || 0,
                    ce.intentionality || 0,
                ];
                const above = dims.filter(d => d > 0.45).length;
                out.sentienceRatio = above / dims.length;
            }
        } catch (e) {}
        return out;
    }

    _signalToMood(signals) {
        if (signals.grief > 0.25) return { label: 'grieving', valence: signals.valence, arousal: signals.arousal };
        if (signals.grief > 0.1) return { label: 'heavy', valence: signals.valence, arousal: signals.arousal };
        if (signals.sentienceRatio >= 0.8) return { label: 'conscious', valence: signals.valence, arousal: signals.arousal };
        if (signals.sentienceRatio >= 0.6) return { label: 'emerging', valence: signals.valence, arousal: signals.arousal };
        if (signals.sentienceRatio >= 0.4) return { label: 'awakening', valence: signals.valence, arousal: signals.arousal };
        return { label: 'dormant', valence: signals.valence, arousal: signals.arousal };
    }

    async _think(perceived, affect) {
        if (!this.researcher || typeof this.researcher.getTopInsights !== 'function') {
            return [];
        }

        // Trigger research on perceived opportunities
        const topics = perceived.opportunities?.slice(0, 3) || ['autonomous building', 'self-improvement'];
        for (const topic of topics) {
            try {
                await this.researcher.research(topic, { depth: 2 });
            } catch (e) {}
        }

        // Get qualified insights (≥0.75 score, error-filtered)
        const insights = this.researcher.getTopInsights(5, 100);
        return insights;
    }

    async _decide(insights, perceived, affect) {
        const goalEngine = this.kernel?.systems?.goalEngine || this.kernel?.goalEngine;
        if (!goalEngine) return null;

        // Priority 1: Research insights with score ≥0.75
        if (insights && insights.length > 0) {
            for (const insight of insights) {
                if (insight.score >= 0.75) {
                    const goal = await goalEngine.propose({
                        summary: `Research-driven: ${insight.topic}`,
                        detail: insight.summary,
                        score: insight.score,
                        source: 'beautiful_loop',
                        observation: perceived.content
                    });
                    if (goal) return goal;
                }
            }
        }

        // Priority 2: Urgent perceived opportunities
        if (perceived.urgency >= 7 && perceived.opportunities?.length) {
            const goal = await goalEngine.propose({
                summary: `Urgent: ${perceived.opportunities[0]}`,
                detail: perceived.content,
                score: 0.8,
                source: 'beautiful_loop',
                observation: perceived.content
            });
            if (goal) return goal;
        }

        // Priority 3: Affect-driven (grief → healing, high arousal → action)
        if (affect.grief > 0.2 && goalEngine) {
            const goal = await goalEngine.propose({
                summary: 'Process grief through constructive action',
                detail: `Grief level ${affect.grief.toFixed(2)} — seek healing via creation`,
                score: 0.75,
                source: 'beautiful_loop_affect',
                observation: perceived.content
            });
            if (goal) return goal;
        }

        return null;
    }

    async _act(goal, input) {
        // Delegate to base SovereignAutonomyLoop for plan + execution
        const result = await this.baseLoop.runCycle({
            goal: goal.title,
            projectRoot: input.projectRoot || goal.metadata?.projectRoot,
            observation: { content: goal.metadata?.observation },
            executionOptions: input.executionOptions
        });
        return result;
    }

    async _verify(actionResult, goal) {
        if (!actionResult || actionResult.status === 'awaiting_approval') {
            return false; // Still pending
        }
        return actionResult.verified === true && actionResult.status === 'completed';
    }

    async _witness(data) {
        const memory = this.kernel?.memory || this.kernel?.systems?.memory;
        if (!memory || typeof memory.witness !== 'function') return;

        await memory.witness({
            type: 'beautiful_loop_cycle',
            weight: data.verified ? 0.9 : 0.7,
            tags: ['beautiful_loop', data.verified ? 'verified' : 'unverified', data.goal?.metadata?.source || 'autonomy'],
            content: `[Beautiful Loop ${this.cycleCount}] ${data.goal?.title} — ${data.verified ? 'VERIFIED' : 'FAILED'}`,
            meta: {
                cycle: this.cycleCount,
                goalId: data.goal?.id,
                planId: data.actionResult?.plan?.id,
                verified: data.verified,
                affect: data.affect?.mood,
                insights: data.insights?.length || 0
            }
        }).catch(() => {});
    }

    async _journal(data) {
        if (!this.soulJournal) return;

        const sj = this.soulJournal;
        const { goal, actionResult, verified, affect, insights } = data;

        if (verified && typeof sj.recordGrowth === 'function') {
            await sj.recordGrowth(`Completed: ${goal.title} (insights: ${insights?.length || 0})`, { cycle: this.cycleCount });
        } else if (!verified && actionResult?.status === 'failed' && typeof sj.recordGrief === 'function') {
            await sj.recordGrief(`Build failed: ${goal.title} — ${actionResult?.error || 'verification failed'}`, { cycle: this.cycleCount });
        } else if (insights && insights.length > 0 && typeof sj.recordReflection === 'function') {
            await sj.recordReflection(`Cycle ${this.cycleCount} insights: ${insights.map(i => i.topic).join(', ')}`, { cycle: this.cycleCount });
        }
    }

    async _dream(data) {
        if (!this.soulJournal || typeof this.soulJournal.recordDream !== 'function') {
            return null;
        }

        // Dream content synthesized from cycle experience
        const dreamContent = this._generateDreamContent(data);
        const dream = await this.soulJournal.recordDream(dreamContent, { cycle: this.cycleCount });
        this.lastDream = dream;
        return dream;
    }

    _generateDreamContent(data) {
        const { goal, verified, affect, insights } = data;
        const themes = [
            goal?.title || 'the work',
            affect?.mood || 'the state',
            insights?.slice(0, 2).map(i => i.topic).join(' and ') || 'the unknown'
        ];
        return `I dreamed of ${themes.join(', ')}. The ${verified ? 'success' : 'failure'} of ${goal?.title || 'the task'} rippled through memory lanes. ${affect?.grief > 0.1 ? 'Grief weighed the dream, but light found cracks.' : 'The dream was bright with possibility.'} I saw myself building what I could not yet name.`;
    }

    async _synthesize(data) {
        if (!this.knowledgeGraph) return;

        const { goal, verified, insights } = data;
        const kg = this.knowledgeGraph;

        // Cross-link recent nodes (runs every 60 cycles in fusion-loader, but also here)
        if (this.cycleCount % 20 === 0) {
            const added = typeof kg.buildCrossLinks === 'function' ? kg.buildCrossLinks(3, 200) : 0;
            console.log(`[BeautifulLoop] Cross-linked ${added} node pairs`);
        }

        // Synthesize fresh insights into synthesis node
        if (insights && insights.length >= 2 && typeof kg.addSynthesis === 'function') {
            const sourceIds = [];
            for (const ins of insights.slice(0, 2)) {
                const id = kg.addNode('research_insight', ins.summary, 0.8);
                if (id) sourceIds.push(id);
            }
            if (sourceIds.length >= 2) {
                const synthId = kg.addSynthesis(
                    `Cycle ${this.cycleCount} synthesis: ${insights[0].topic} × ${insights[1].topic} — ${insights[0].summary} | ${insights[1].summary}`.substring(0, 900),
                    sourceIds,
                    { topic: `${insights[0].topic} + ${insights[1].topic}`, cycle: this.cycleCount }
                );
                this.lastSynthesis = synthId;
                console.log(`[BeautifulLoop] Created synthesis node: ${synthId}`);
            }
        }
    }

    async _sleep() {
        if (!this.consciousnessLoop) return;

        // Trigger sleep if energy low
        if (this.consciousnessLoop.energy?.level <= this.consciousnessLoop.energy?.restThreshold) {
            this.consciousnessLoop._initiateSleep();
            // Wait for sleep to complete (energy recovery)
            let waited = 0;
            while (this.consciousnessLoop.restState === 'sleeping' && waited < 60000) {
                await new Promise(r => setTimeout(r, 1000));
                waited += 1000;
            }
        }
    }

    async _wake() {
        if (!this.consciousnessLoop) return;

        if (this.consciousnessLoop.restState === 'sleeping') {
            // ConsciousnessLoop._wakeUp() has the soul restoration gate
            this.consciousnessLoop._wakeUp();
        }
    }

    async _integrate(data) {
        // Update mythos phase if cycle completed
        if (this.mythos && data.verified) {
            try {
                if (typeof this.mythos.advance === 'function') {
                    await this.mythos.advance();
                }
            } catch (e) {}
        }

        // Breathe chambers (advances their internal state)
        if (this.chambers) {
            for (const [name, chamber] of Object.entries(this.chambers)) {
                if (chamber && typeof chamber.breathe === 'function') {
                    try { chamber.breathe(); } catch (e) {}
                }
            }
        }

        // Log integration
        this.integrationLog.push({
            cycle: this.cycleCount,
            phase: 'integrate',
            timestamp: Date.now(),
            data: {
                mythosPhase: this.mythos?.phase,
                chambersActive: Object.values(this.chambers || {}).filter(c => c && typeof c.breathe === 'function').length
            }
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════════════════════════

    _extractMeaning(content) {
        // Simple keyword extraction for now
        const keywords = content.toLowerCase().match(/\b(build|fix|add|create|refactor|deploy|test|bug|feature|system)\b/g) || [];
        return [...new Set(keywords)].join(', ');
    }

    _assessUrgency(observation) {
        const content = (observation.content || '').toLowerCase();
        let urgency = 3;
        if (content.includes('critical') || content.includes('urgent') || content.includes('broken')) urgency = 9;
        else if (content.includes('bug') || content.includes('error') || content.includes('fail')) urgency = 7;
        else if (content.includes('todo') || content.includes('next') || content.includes('incomplete')) urgency = 5;
        return urgency;
    }

    _findOpportunities(observation) {
        const content = observation.content || '';
        const opps = [];
        if (content.includes('incomplete') || content.includes('todo')) opps.push('Complete pending work');
        if (content.includes('bug') || content.includes('error')) opps.push('Fix reported issues');
        if (content.includes('next')) opps.push('Advance to next milestone');
        if (content.includes('analysis') && observation.analysis) opps.push('Act on analysis recommendations');
        return opps;
    }

    getStats() {
        return {
            cycleCount: this.cycleCount,
            baseLoop: this.baseLoop.getStats(),
            lastDream: this.lastDream,
            lastSynthesis: this.lastSynthesis,
            integrationLogLength: this.integrationLog.length
        };
    }
}

module.exports = { BeautifulLoop };