(function (root, factory) {
  const node = typeof module === 'object' && module.exports;
  const api = factory(node ? require('./core.js') : root.PactCore);
  if (node) module.exports = api;
  else root.PactAutopilot = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (Core) {
'use strict';

/*
 * Full-state campaign autopilot.  It only returns the same input values a
 * player can send to World.step; it never mutates the observed world.
 */
const { clamp, angle, dist, segmentHit } = Core;

const finite = n => Number.isFinite(n) ? n : 0;
const unit = (x, y) => {
  const d = Math.hypot(x, y);
  return d > 1 ? { x: x / d, y: y / d } : { x, y };
};

function input(world, dt = 1 / 120) {
  if (!world || world.phase !== 'combat') return { mx: 0, my: 0, shoot: false };
  const p = world.p, t = finite(world.time), portrait = world.layout === 'portrait';
  // A broad, slowly changing orbit keeps the ship away from stationary guns
  // while avoiding the arena walls where a dodge has fewer exits.
  const r = portrait ? world.width * .28 : world.width * .31;
  const centerY = portrait ? world.height * .60 : world.height * .53;
  const goalX = world.width * .5 + Math.sin(t * .47) * r;
  const goalY = centerY + Math.cos(t * .47) * (portrait ? world.height * .18 : 108);
  let mx = (goalX - p.x) / 120, my = (goalY - p.y) / 120;
  let imminent = 0, nearby = 0, laserThreat = false;

  for (const b of world.bullets || []) {
    if (!b || !b.hostile || b.life <= 0) continue;
    const dx = p.x - b.x, dy = p.y - b.y, d = Math.hypot(dx, dy);
    if (d < 82) nearby++;
    // Check the bullet's short future path, not just its current distance.
    if (d < 220) {
      const horizon = Math.min(.42, Math.max(.16, d / Math.max(80, Math.hypot(b.vx, b.vy))));
      const fx = b.x + b.vx * horizon, fy = b.y + b.vy * horizon;
      const miss = Math.hypot(fx - p.x, fy - p.y);
      if (miss < 74) {
        const n = unit(p.x - fx, p.y - fy), force = (74 - miss) / 26;
        mx += n.x * force; my += n.y * force; imminent++;
      }
    }
  }
  for (const e of world.enemies || []) {
    if (!e || e.hp <= 0 || e.spawn > 0) continue;
    const dx = p.x - e.x, dy = p.y - e.y, d = Math.hypot(dx, dy);
    if (d < e.r + 105) {
      const n = unit(dx, dy), force = (e.r + 105 - d) / 38;
      mx += n.x * force; my += n.y * force;
    }
  }
  for (const l of world.lasers || []) {
    if (!l || l.t <= 0) continue;
    const hit = segmentHit(l.x, l.y, l.x + Math.cos(l.a) * 1800,
      l.y + Math.sin(l.a) * 1800, p.x, p.y, (l.width || 20) + 35);
    if (!hit) continue;
    laserThreat = true;
    const side = Math.sin(l.a) * (p.x - l.x) - Math.cos(l.a) * (p.y - l.y) >= 0 ? 1 : -1;
    mx += Math.sin(l.a) * side * 3.8;
    my -= Math.cos(l.a) * side * 3.8;
  }
  // Keep a little room from the boundary so a dash does not terminate into it.
  const margin = 72;
  if (p.x < world.bounds.left + margin) mx += 1.7;
  if (p.x > world.bounds.right - margin) mx -= 1.7;
  if (p.y < world.bounds.top + margin) my += 1.7;
  if (p.y > world.bounds.bottom - margin) my -= 1.7;
  ({ x: mx, y: my } = unit(mx, my));

  const target = (world.enemies || []).filter(e => e.hp > 0 && e.spawn <= 0)
    .sort((a, b) => dist(a, p) - dist(b, p))[0];
  const aimX = target ? target.x : p.x + Math.cos(p.angle) * 100;
  const aimY = target ? target.y : p.y + Math.sin(p.angle) * 100;
  const parry = p.parryCd <= 0 && (nearby > 0 || imminent > 0);
  // Dash is reserved for an imminent line hazard or a crowded ship.  The
  // invulnerability supplied by World.step is therefore used as an escape.
  const dash = p.dashCd <= 0 && (laserThreat || imminent >= 2 || (nearby >= 2 && p.parry > 0));
  const nova = p.energy >= (typeof world.novaCost === 'function' ? world.novaCost() : 100) &&
    ((world.enemies || []).filter(e => e.hp > 0).length >= 3 || world.wave === 2 || imminent >= 2);
  return {
    mx, my, shoot: true, autoAim: false,
    aimX, aimY, aimx: aimX, aimy: aimY,
    parry, dash, nova
  };
}

const UPGRADE_SCORE = {
  hull: 100, repair: 150, rapid: 93, rail: 90, homing: 88, orbit: 87,
  echo: 84, parry: 82, nova: 78, scatter: 72, leech: 76, magnet: 58, razor: 54
};
function chooseUpgrade(world) {
  if (!world || !Array.isArray(world.offers) || !world.offers.length) return null;
  const low = world.p && world.p.hp <= world.p.maxHp * .55;
  return [...world.offers].sort((a, b) => {
    const av = (UPGRADE_SCORE[a.id] || 0) + (low && a.id === 'repair' ? 80 : 0);
    const bv = (UPGRADE_SCORE[b.id] || 0) + (low && b.id === 'repair' ? 80 : 0);
    return bv - av;
  })[0].id;
}
function chooseRoute(world) {
  if (!world || !Array.isArray(world.routeHistory)) return 'refuge';
  return 'refuge';
}
function chooseRelic(world) {
  if (!world || !Array.isArray(world.shop)) return [];
  const order = ['second', 'lens', 'capacitor', 'satellite', 'echo', 'needle', 'nova', 'razor'];
  return world.shop.filter(r => r && order.includes(r.id))
    .sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id)).map(r => r.id);
}
function chooseContract(world) {
  const offers = world && typeof world.offersForPact === 'function' ? world.offersForPact() : [];
  // Stable Story contract route used by the spoken demo: reflection damage
  // early and late, sanctuary for sector 1, and duel for sector 3.
  const sequence = ['mirror', 'sanctuary', 'mirror', 'duel', 'mirror', 'mirror'];
  const preferred = sequence[Math.max(0, Math.min(5, world && Number.isFinite(world.stage) ? world.stage : 0))];
  const order = [preferred, 'mercy', 'sanctuary', 'duel', 'silence', 'mirror', 'velocity', 'glass'];
  return order.find(id => offers.some(c => c.id === id)) || (offers[0] && offers[0].id) || null;
}

const Controller = { input, chooseUpgrade, chooseRoute, chooseRelic, chooseContract };
return { Controller, input, chooseUpgrade, chooseRoute, chooseRelic, chooseContract };
});
