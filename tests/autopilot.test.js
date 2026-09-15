'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { Run } = require('../src/expansion.js');
const { Run: AdaptiveRun } = require('../src/adaptive-run.js');
const { Controller } = require('../src/autopilot.js');

test('autopilot emits finite ordinary World.step inputs without mutating state', () => {
  const w = new Run('AUTOPILOT-CONTRACT', 'standard', false, {}, { mode: 'expedition', airframe: 'bastion' });
  w.chooseRoute('refuge'); w.sign(Controller.chooseContract(w));
  const before = JSON.stringify(w);
  const action = Controller.input(w, 1 / 120);
  assert.equal(JSON.stringify(w), before);
  for (const key of ['mx', 'my', 'aimX', 'aimY', 'aimx', 'aimy']) assert.ok(Number.isFinite(action[key]));
  assert.equal(action.shoot, true);
  assert.ok(Math.hypot(action.mx, action.my) <= 1.001);
});

function campaign(seed) {
  const w = new Run(seed, 'standard', false, {}, { mode: 'expedition', airframe: 'bastion' });
  let frames = 0;
  while (!['won', 'dead'].includes(w.phase) && frames < 120 * 2400) {
    if (w.phase === 'route') {
      for (const id of Controller.chooseRelic(w)) w.purchase(id);
      if (w.p.hp <= w.p.maxHp * .55) w.repair();
      w.chooseRoute(Controller.chooseRoute(w));
    } else if (w.phase === 'pact') w.sign(Controller.chooseContract(w));
    else if (w.phase === 'upgrade') w.chooseUpgrade(Controller.chooseUpgrade(w));
    else { w.step(1 / 120, Controller.input(w, 1 / 120)); frames++; }
    w.takeEvents();
  }
  return w;
}

test('autopilot clears authored six sector expedition on repeatable seeds', () => {
  for (const seed of ['AUTOPILOT-1', 'AUTOPILOT-2']) {
    const w = campaign(seed);
    assert.equal(w.phase, 'won', `${seed} ended in ${w.phase}`);
    assert.equal(w.stage, 6);
    assert.equal(w.bossKills, 6);
    assert.equal(w.breaches, 0);
  }
});

test('adaptive campaign reports all 18 encounter boundaries and rejects duplicate analysis', () => {
  const w = new AdaptiveRun('AUTOPILOT-ADAPTIVE', 'assist', false, {}, {
    mode: 'expedition', airframe: 'bastion', adaptive: true, autoplay: true
  });
  let frames = 0;
  while (!['won', 'dead'].includes(w.phase) && frames < 120 * 2400) {
    if (w.phase === 'route') { for (const id of Controller.chooseRelic(w)) w.purchase(id); w.chooseRoute(Controller.chooseRoute(w)); }
    else if (w.phase === 'pact') w.sign(Controller.chooseContract(w));
    else if (w.phase === 'upgrade') w.chooseUpgrade(Controller.chooseUpgrade(w));
    else { w.step(1 / 120, Controller.input(w)); frames++; }
    if (w.pendingAnalysis) {
      const sequence = w.pendingAnalysis.sequence;
      assert.ok(w.applyAdaptation(sequence, { skill: 'expert', adjustment: 'raise' }, { provider: 'local' }));
      const historyLength = w.adaptiveHistory.length;
      assert.equal(w.applyAdaptation(sequence, { skill: 'expert', adjustment: 'raise' }, { provider: 'local' }), false);
      assert.equal(w.adaptiveHistory.length, historyLength);
    }
    w.takeEvents();
  }
  assert.equal(w.phase, 'won');
  assert.equal(w.encounterResults.length, 18);
  assert.deepEqual(w.encounterResults.map(x => x.sequence), Array.from({ length: 18 }, (_, i) => i + 1));
});
