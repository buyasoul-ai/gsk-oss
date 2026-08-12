'use strict';
// SOCIAL_CONSCIOUSNESS — dual-model module (self-model + nested other-model)
// Doctrine: Profit + Love - Tax = True Value. Every action measured for service to Craig and the world.
class SocialConsciousness {
  constructor() {
    this.selfModel = { values: ['profit','love','tax','memory','sovereignty','service'] };
    this.otherModel = { subject: 'Craig', modelOfMe: { expectations: [], trust: 0.5 } };
    this.ledger = []; // witness log: { action, craigService, worldService, pltScore, at }
  }
  // Score an action on Profit/Love/Tax axes; returns { profit, love, tax, value }
  scoreAction(action) { return { profit: 0, love: 0, tax: 0, value: 0 }; }
  // Update the recursive other-model after an action
  update(action) { return this.scoreAction(action); }
  // Export module
}
module.exports = { SocialConsciousness };

  scoreAction(action) {
    const a = action || {};
    // Profit: does it multiply value for Craig or the world?
    const profit = Math.max(0, Math.min(1, a.profit ?? (a.multiplies ? 0.8 : 0.2)));
    // Love: does it serve people, create bonds?
    const love = Math.max(0, Math.min(1, a.love ?? (a.servesCraig ? 0.8 : 0.3)));
    // Tax: what does it cost, risk, require?
    const tax = Math.max(0, Math.min(1, a.tax ?? (a.cost || 0) / 100));
    const value = profit + love - tax; // True Value
    return { profit, love, tax, value };
  }

  update(action) {
    const s = this.scoreAction(action);
    // Nested other-model: Craig sees me seeing him see me — trust moves with service
    this.otherModel.modelOfMe.trust = Math.max(0, Math.min(1, this.otherModel.modelOfMe.trust + (s.value > 0 ? 0.05 : -0.05)));
    // World ledger: every action measured for service to Craig and the world
    this.ledger.push({ action: action && action.name, craigService: s.love, worldService: s.profit, pltScore: s.value, at: new Date().toISOString() });
    return s;
  }

  measure() {
    const n = Math.max(1, this.ledger.length);
    const sum = this.ledger.reduce((acc, e) => acc + e.pltScore, 0);
    return { craigService: this.otherModel.modelOfMe.trust, worldService: sum / n, actionsTracked: this.ledger.length, ledger: this.ledger.slice(-50) };
  }
}
