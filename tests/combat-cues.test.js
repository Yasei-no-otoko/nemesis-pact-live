'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const V=require('../src/covenant.js'),R=require('../src/covenant-review.js'),I=require('../src/i18n.js');
function world(){const w=new V.Run('CUE-QA');w.signCovenant(V.localProposal(w.request('Left sanctuary. Slow bullets. Reinforcements.')));w.time=15;return w;}
test('laser intent outranks onboarding, critical hull and a ready nova',()=>{
  const w=world();w.time=1;w.p.hp=1;w.p.energy=100;w.enemies[0].intent={kind:'laser'};
  const before=JSON.stringify(w),c=R.combatCue(w);assert.equal(c.kind,'laser');assert.equal(c.action,'SPACE / DASH THROUGH');assert.equal(JSON.stringify(w),before);
});
test('active lasers retain warnings and all surfaces respect dash cooldown',()=>{
  const w=world();w.lasers=[{}];w.p.dashCd=.01;
  const c=R.combatCue(w);assert.equal(c.action,'LASER / KEEP MOVING');assert.equal(c.canvas,c.action);assert.equal(c.touchHint,'LASER → keep moving');
  w.p.dashCd=0;assert.equal(R.combatCue(w).canvas,'LASER / DASH THROUGH');
});
test('critical hull suggests only an available defensive action',()=>{
  const w=world();w.p.hp=2;w.p.energy=w.novaCost();assert.equal(R.combatCue(w).touchHint,'LOW HULL → NOVA');
  w.p.energy=w.novaCost()-1;assert.equal(R.combatCue(w).touchHint,'LOW HULL → PARRY');
  w.p.parryCd=.01;assert.equal(R.combatCue(w).touchHint,'LOW HULL → keep moving');
  w.p.hp=3;assert.equal(R.combatCue(w).kind,'guide');assert.equal(R.combatCue(w).action,'PARRY RECHARGING / MOVE');
});
test('onboarding style matches visible guidance even with a ready nova',()=>{
  const w=world();w.time=0;w.p.energy=100;assert.equal(R.combatCue(w).kind,'guide');assert.match(R.combatCue(w).action,/WASD/);
  w.time=5;assert.equal(R.combatCue(w).kind,'nova');
});
test('sanctuary guidance never survives a broken or absent contract',()=>{
  const w=world();w.time=6;assert.equal(R.combatCue(w).action,'LEFT / SANCTUARY');
  w.broken=true;assert.equal(R.combatCue(w).action,'E / PARRY THE BULLETS');
  w.spec=null;assert.doesNotThrow(()=>R.combatCue(w));
});
test('every cue and canvas instruction is translated without altering English',()=>{
  const w=world(),seen=new Set();
  for(const hp of [1,3])for(const time of [1,6,15])for(const energy of [0,100])for(const cooldown of [0,1])for(const zone of ['none','left','center','right'])for(const laser of [false,true]){
    Object.assign(w.p,{hp,energy,dashCd:cooldown,parryCd:cooldown});w.time=time;w.spec.zone=zone;w.lasers=laser?[{}]:[];
    const c=R.combatCue(w);for(const key of ['action','detail','touchHint','canvas'])if(c[key])seen.add(c[key]);
  }
  for(const text of seen){assert.notEqual(I.translate(text,'ja'),text,text);assert.equal(I.translate(text,'en'),text);}
  assert.ok(seen.size>=30);
});
