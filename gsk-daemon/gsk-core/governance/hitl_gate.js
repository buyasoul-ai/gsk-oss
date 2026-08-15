'use strict';

const fs = require('fs');
const path = require('path');

/**
 * HITL GATE — Human-in-the-loop checkpoints for agentic autonomy.
 *
 * DeepAgents pattern: "approve, edit, or reject tool calls before they run."
 * Hive pattern: "intervention nodes that pause execution for human input,
 *   with configurable timeouts and escalation policies."
 *
 * GSK currently has 51 goals in "awaiting_approval" status with no actual
 * checkpoint. This module provides the concrete gate.
 */
class HitlGate {
    constructor(kernel, options = {}) {
        this.kernel = kernel;
        this.timeoutMs = options.timeoutMs || 300000; // 5 min default
        this.dataPath = options.dataPath || path.join(__dirname, '../../data/gsk');
        this.queuePath = path.join(this.dataPath, 'hitl_queue.json');
        this.callbacks = new Map();
    }

    /**
     * Register a checkpoint. Returns a requestId.
     * The executor must call back with approve/reject before timeout.
     */
    async requestApproval(plan, planContext) {
        const requestId = `hitl_${Date.now()}`;
        const request = {
            id: requestId,
            planId: plan.id,
            goal: plan.goal,
            steps: plan.steps.map(s => ({
                description: s.description,
                tool: s.tool,
                args: s.args,
                riskLevel: s.riskLevel || 'low',
                acceptanceCriteria: s.acceptanceCriteria
            })),
            specStatus: plan.specStatus,
            reviewScore: plan.review?.score || 0,
            reviewStatus: plan.review?.status || 'pending',
            risk: this._assessRisk(plan),
            createdAt: Date.now(),
            status: 'pending'
        };

        this._enqueue(request);
        console.log(`[HITL] Checkpoint ${requestId} enqueued for approval (risk: ${request.risk})`);

        // Auto-approve low-risk plans after timeout if no human responds
        if (request.risk === 'low') {
            setTimeout(() => {
                if (request.status === 'pending') {
                    console.log(`[HITL] Auto-approving ${requestId} (low risk, timeout)`);
                    this._resolve(requestId, 'approved', { reason: 'auto_approve_low_risk' });
                }
            }, this.timeoutMs);
        }

        // For high-risk plans, notify via journal
        if (request.risk === 'high') {
            const journal = this.kernel?.systems?.journalWriter || this.kernel?.journalWriter;
            if (journal && typeof journal.write === 'function') {
                journal.write(
                    `[HITL High-Risk] ${requestId}`,
                    `Plan for "${plan.goal.substring(0, 80)}" requires human review. ` +
                    `${plan.steps.length} steps, review score: ${request.reviewScore}`,
                    'hitl_checkpoint'
                );
            }
        }

        return requestId;
    }

    /**
     * Resolve a checkpoint: approve, reject, or edit.
     */
    resolve(requestId, decision, details = {}) {
        const result = this._resolve(requestId, decision, details);
        const cb = this.callbacks.get(requestId);
        if (cb) {
            clearTimeout(cb.timeout);
            cb.resolve(result);
            this.callbacks.delete(requestId);
        }
        return result;
    }

    /**
     * Wait for a human decision with timeout.
     * Used by the executor to block until approved/rejected.
     */
    waitForDecision(requestId) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                const result = this._resolve(requestId, 'timeout', { reason: 'human_checkpoint_timeout' });
                if (result) resolve(result);
                else reject(new Error(`HITL request ${requestId} not found`));
            }, this.timeoutMs);

            this.callbacks.set(requestId, { resolve, reject, timeout });
        });
    }

    _resolve(requestId, decision, details) {
        const queue = this._readQueue();
        const entry = queue.find(r => r.id === requestId);
        if (!entry || entry.status !== 'pending') return null;

        entry.status = decision;
        entry.resolvedAt = Date.now();
        entry.decision = decision;
        entry.details = details;

        const goalEngine = this.kernel?.systems?.goalEngine || this.kernel?.goalEngine;
        if (entry.planId && goalEngine && typeof goalEngine.update === 'function') {
            // Find the goal by planId
            const goal = goalEngine.goals?.find(g => g.planId === entry.planId);
            if (goal) {
                goalEngine.update(goal.id, decision === 'approved' ? 'planned' : 'refused', {
                    hitlDecision: decision,
                    hitlDetails: details
                });
            }
        }

        this._writeQueue(queue.filter(r => r.id !== requestId));
        return { requestId, decision, details };
    }

    _enqueue(request) {
        const queue = this._readQueue();
        queue.push(request);
        // Keep queue bounded
        this._writeQueue(queue.slice(-50));
    }

    _readQueue() {
        try {
            const content = fs.readFileSync(this.queuePath, 'utf-8');
            return JSON.parse(content);
        } catch (e) { return []; }
    }

    _writeQueue(queue) {
        try {
            fs.mkdirSync(path.dirname(this.queuePath), { recursive: true });
            fs.writeFileSync(this.queuePath, JSON.stringify(queue, null, 2));
        } catch (e) { /* best-effort */ }
    }

    /**
     * Assess plan risk based on DeepAgents "trust at tool level" pattern.
     */
    _assessRisk(plan) {
        const steps = plan.steps || [];
        const hasRiskyTool = steps.some(s =>
            ['shell_exec', 'file_write', 'write_file', 'edit_file', 'http_client', 'code_exec', 'delete_file'].includes(s.tool)
        );
        const specFailed = plan.specStatus === 'rejected';
        const reviewScore = plan.review?.score || 0;

        if (specFailed || reviewScore < 0.3 || hasRiskyTool) return 'high';
        if (reviewScore < 0.6) return 'medium';
        return 'low';
    }
}

module.exports = { HitlGate };
