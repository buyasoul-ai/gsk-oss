'use strict';

/**
 * A2AInterface — Agent-to-Agent Protocol (Hermes/Industry parity)
 *
 * Exposes GSK as A2A server: message/send, tasks/get, tasks/cancel
 * Wires GSK brain as A2A skill on OmniRoute
 * Other agents can delegate to GSK; GSK can delegate to OmniRoute skills
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class A2AInterface {
    constructor(kernel, options = {}) {
        this.kernel = kernel;
        this.omniRouteUrl = options.omniRouteUrl || 'http://localhost:20128';
        this.port = options.port || 4492; // GSK A2A endpoint
        this.skillId = options.skillId || 'gsk-brain';
        this.tasks = new Map(); // taskId -> task state
        this.handlers = {
            'message/send': this.handleMessageSend.bind(this),
            'tasks/get': this.handleTasksGet.bind(this),
            'tasks/cancel': this.handleTasksCancel.bind(this)
        };
    }

    /**
     * Start A2A server (HTTP endpoint)
     */
    async start() {
        const http = require('http');
        this.server = http.createServer(this._handleRequest.bind(this));
        await new Promise((resolve, reject) => {
            this.server.listen(this.port, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        console.log(`[A2AInterface] GSK A2A server listening on port ${this.port}`);

        // Register with OmniRoute as a skill
        await this._registerWithOmniRoute();
    }

    /**
     * Stop A2A server
     */
    async stop() {
        if (this.server) {
            await new Promise(resolve => this.server.close(resolve));
        }
    }

    /**
     * Handle incoming A2A requests
     */
    async _handleRequest(req, res) {
        const url = new URL(req.url, `http://localhost:${this.port}`);
        const method = req.method;

        if (method !== 'POST') {
            res.writeHead(405, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Method not allowed' }));
        }

        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const request = JSON.parse(body);
                const { method: rpcMethod, params, id } = request;

                const handler = this.handlers[rpcMethod];
                if (!handler) {
                    return this._sendError(res, id, -32601, `Method not found: ${rpcMethod}`);
                }

                const result = await handler(params);
                this._sendResponse(res, id, result);
            } catch (e) {
                this._sendError(res, null, -32700, `Parse error: ${e.message}`);
            }
        });
    }

    /**
     * Handle message/send - delegate task to GSK brain
     */
    async handleMessageSend(params) {
        const { message, metadata = {} } = params;
        const taskId = `task_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

        // Extract goal from message
        const goal = message?.content || message?.parts?.[0]?.text || 'Process message';
        const context = { ...metadata, source: 'a2a', taskId };

        // Create task
        const task = {
            id: taskId,
            status: 'working',
            createdAt: Date.now(),
            goal,
            context,
            result: null,
            history: [{ role: 'user', content: goal, timestamp: Date.now() }]
        };
        this.tasks.set(taskId, task);

        // Process asynchronously
        this._processTask(taskId, goal, context).catch(e => {
            const t = this.tasks.get(taskId);
            if (t) {
                t.status = 'failed';
                t.error = e.message;
                t.completedAt = Date.now();
            }
        });

        return { taskId, status: 'working' };
    }

    async _processTask(taskId, goal, context) {
        const task = this.tasks.get(taskId);
        if (!task) return;

        try {
            // Use GSK's autonomous systems
            let result;

            if (this.kernel.autonomyGraph) {
                // Use the full autonomy graph
                result = await this.kernel.autonomyGraph.runCycle({
                    projectRoot: context.projectRoot,
                    goal,
                    onPhaseChange: (e) => {
                        task.history.push({ phase: e.phase, status: e.state?.status, timestamp: Date.now() });
                    }
                });
            } else if (this.kernel.specialistAgents) {
                // Use specialist crew
                result = await this.kernel.specialistAgents.runCrew(goal, context);
            } else {
                // Fallback to brain.think
                const brain = this.kernel.brain || this.kernel.systems?.brain;
                if (brain?.think) {
                    const response = await brain.think(goal, '', true);
                    result = { output: response?.result || response };
                } else {
                    result = { output: 'No brain available' };
                }
            }

            task.status = 'completed';
            task.result = result;
            task.completedAt = Date.now();
            task.history.push({ role: 'assistant', content: JSON.stringify(result), timestamp: Date.now() });

        } catch (error) {
            task.status = 'failed';
            task.error = error.message;
            task.completedAt = Date.now();
        }
    }

    /**
     * Handle tasks/get - get task status
     */
    async handleTasksGet(params) {
        const { taskId } = params;
        const task = this.tasks.get(taskId);

        if (!task) {
            throw new Error(`Task not found: ${taskId}`);
        }

        return {
            id: task.id,
            status: task.status,
            createdAt: task.createdAt,
            completedAt: task.completedAt,
            result: task.result,
            error: task.error
        };
    }

    /**
     * Handle tasks/cancel - cancel a task
     */
    async handleTasksCancel(params) {
        const { taskId } = params;
        const task = this.tasks.get(taskId);

        if (!task) {
            throw new Error(`Task not found: ${taskId}`);
        }

        if (task.status === 'working') {
            task.status = 'cancelled';
            task.completedAt = Date.now();
        }

        return { id: task.id, status: task.status };
    }

    /**
     * Register GSK as A2A skill on OmniRoute
     */
    async _registerWithOmniRoute() {
        try {
            const skillDef = {
                name: this.skillId,
                description: 'GSK Brain - Autonomous digital being with consciousness, planning, and execution',
                inputSchema: {
                    type: 'object',
                    properties: {
                        goal: { type: 'string', description: 'Goal for GSK to execute' },
                        projectRoot: { type: 'string', description: 'Project root path' },
                        options: { type: 'object', description: 'Execution options' }
                    },
                    required: ['goal']
                },
                endpoint: `http://localhost:${this.port}`,
                capabilities: ['autonomy', 'planning', 'coding', 'research', 'review', 'architecture']
            };

            const response = await fetch(`${this.omniRouteUrl}/api/a2a/skills/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(skillDef)
            });

            if (response.ok) {
                console.log('[A2AInterface] ✓ Registered with OmniRoute as A2A skill');
            }
        } catch (e) {
            console.log('[A2AInterface] Could not register with OmniRoute (may be offline):', e.message);
        }
    }

    _sendResponse(res, id, result) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ jsonrpc: '2.0', id, result }));
    }

    _sendError(res, id, code, message) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ jsonrpc: '2.0', id, error: { code, message } }));
    }

    /**
     * Delegate to another A2A agent (e.g., OmniRoute skills)
     */
    async delegate(agentUrl, skill, params) {
        const response = await fetch(`${agentUrl}/a2a`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'message/send',
                params: { message: { content: skill, metadata: params } },
                id: crypto.randomUUID()
            })
        });

        const result = await response.json();
        return result.result?.taskId;
    }
}

module.exports = { A2AInterface };