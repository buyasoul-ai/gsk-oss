'use strict';

class SovereignAutonomyLoop {
    constructor(kernel, options = {}) {
        this.kernel = kernel;
        this.perceive = options.perceive || (async input => input.observation || null);
        this.verify = options.verify || (async ({ plan, execution }) => execution?.success === true && plan?.steps?.every(step => step.status === 'completed'));
        this.running = false;
        this.stats = {
            cyclesAttempted: 0,
            cyclesCompleted: 0,
            cyclesFailed: 0,
            approvalPauses: 0,
            actionsExecuted: 0,
            currentStreak: 0,
            maxStreak: 0,
            lastCycle: null
        };
    }

    async runCycle(input = {}) {
        if (this.running) return { status: 'busy', verified: false };
        this.running = true;
        this.stats.cyclesAttempted++;
        const startedAt = Date.now();

        try {
            const observation = await this.perceive(input);
            const content = String(observation?.content || observation?.summary || '').trim();
            if (!content) throw new Error('No real observation available; refusing fake insight');

            // Skip cycles where the observation is unchanged from a prior failure
            const crypto = require('crypto');
            const contentHash = crypto.createHash('md5').update(content).digest('hex');
            if (this.lastObservationHash === contentHash) {
                const result = { status: 'skipped', verified: false, observation, goal: null, reason: 'observation_unchanged' };
                this._journal(result);
                this.stats.lastCycle = this._summary(result, startedAt);
                return result;
            }
            this.lastObservationHash = contentHash;

            const goalEngine = this.kernel?.systems?.goalEngine || this.kernel?.goalEngine;
            const planningEngine = this.kernel?.systems?.planningEngine || this.kernel?.planningEngine;
            if (!goalEngine || !planningEngine) throw new Error('GoalEngine and PlanningEngine are required');

            const title = String(input.goal || `Act on observed state: ${content}`).substring(0, 160);
            const goal = goalEngine.create(title, observation.source || 'autonomy_loop', {
                projectRoot: observation.projectRoot || input.projectRoot || null,
                observation: content
            });
            if (!goal) throw new Error('GoalEngine rejected the observed goal');

            const plan = await planningEngine.createPlan(goal.title, {
                source: 'sovereign_autonomy_loop',
                projectRoot: observation.projectRoot || input.projectRoot || null,
                analysis: observation.analysis || null,
                observation
            });
            if (!plan?.steps?.length) throw new Error('PlanningEngine produced no executable steps');
            goalEngine.update(goal.id, 'planned', { planId: plan.id });

            const execution = await planningEngine.executePlan(plan, input.executionOptions || {});
            if (plan.status === 'awaiting_approval') {
                this.stats.approvalPauses++;
                goalEngine.update(goal.id, 'awaiting_approval', { planId: plan.id });
                const result = { status: 'awaiting_approval', verified: false, observation, goal, plan, execution };
                this._journal(result);
                this.stats.lastCycle = this._summary(result, startedAt);
                return result;
            }

            const verified = await this.verify({ observation, goal, plan, execution });
            const status = verified ? 'completed' : 'failed_verification';
            goalEngine.update(goal.id, status, { planId: plan.id, completedAt: verified ? Date.now() : null });
            this.stats.actionsExecuted += plan.steps.filter(step => step.status === 'completed').length;
            if (verified) {
                this.stats.cyclesCompleted++;
                this.stats.currentStreak++;
                this.stats.maxStreak = Math.max(this.stats.maxStreak, this.stats.currentStreak);
            } else {
                this.stats.cyclesFailed++;
                this.stats.currentStreak = 0;
            }

            const result = { status, verified, observation, goal, plan, execution };
            this._journal(result);
            await this._witness(result);
            this.stats.lastCycle = this._summary(result, startedAt);
            return result;
        } catch (error) {
            this.stats.cyclesFailed++;
            this.stats.currentStreak = 0;
            const result = { status: 'failed', verified: false, error: error.message };
            this._journal(result);
            await this._witness(result);
            // HIVE PATTERN: On failure, evolve the goal toward concreteness
            const evolver = this.kernel?.systems?.graphEvolver;
            if (evolver && title && evolver.shouldEvolve(title, 'failed', 0)) {
                try {
                    const { evolvedGoal } = await evolver.evolveGoal(title, { error: error.message, result });
                    if (evolvedGoal) {
                        console.log(`[AutonomyLoop] Hive evolution: "${title}" → "${evolvedGoal}"`);
                        await this.runCycle({ goal: evolvedGoal, projectRoot: input.projectRoot });
                        return { status: 'evolved', verified: false, evolvedGoal, originalGoal: title, error: error.message };
                    }
                } catch (e) { /* evolution is best-effort */ }
            }
            this.stats.lastCycle = this._summary(result, startedAt);
            return result;
        } finally {
            this.running = false;
        }
    }

    async runCycles(count, inputFactory = index => ({ cycle: index + 1 })) {
        const results = [];
        for (let index = 0; index < count; index++) {
            const input = typeof inputFactory === 'function' ? await inputFactory(index) : inputFactory;
            const result = await this.runCycle(input || {});
            results.push(result);
            if (result.status === 'awaiting_approval' || result.status === 'busy') break;
        }
        return { requested: count, completed: results.filter(result => result.verified).length, results, stats: this.getStats() };
    }

    _journal(result) {
        const journal = this.kernel?.systems?.journalWriter || this.kernel?.journalWriter;
        if (!journal || typeof journal.write !== 'function') return;
        const goal = result.goal?.title || 'Autonomy cycle';
        const completed = result.plan?.steps?.filter(step => step.status === 'completed').length || 0;
        const total = result.plan?.steps?.length || 0;
        let actionSummary;
        if (total === 0) {
            actionSummary = result.error
                ? `${result.error}`
                : `No plan generated. Observation: ${String(result.observation || '').substring(0, 120)}`;
        } else {
            actionSummary = `${completed}/${total} actions completed.`;
        }
        journal.write(`Autonomy ${result.status}: ${goal.substring(0, 80)}`, `${actionSummary} Verified: ${result.verified}.`.trim(), 'autonomy_cycle');
    }

    async _witness(result) {
        const memory = this.kernel?.memory || this.kernel?.systems?.memory;
        if (!memory || typeof memory.witness !== 'function') return;
        await memory.witness({
            type: 'autonomy_cycle',
            weight: result.verified ? 0.9 : 0.7,
            tags: ['autonomy', result.status, result.verified ? 'verified' : 'unverified'],
            content: `[Autonomy ${result.status}] ${result.goal?.title || result.error || 'cycle'}`,
            meta: { goalId: result.goal?.id || null, planId: result.plan?.id || null, verified: result.verified }
        }).catch(() => {});
    }

    _summary(result, startedAt) {
        return { status: result.status, verified: result.verified, goalId: result.goal?.id || null, planId: result.plan?.id || null, durationMs: Date.now() - startedAt, timestamp: Date.now() };
    }

    getStats() {
        return { ...this.stats };
    }
}

module.exports = { SovereignAutonomyLoop };
