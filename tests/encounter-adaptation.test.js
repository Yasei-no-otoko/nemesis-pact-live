'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {Run}=require('../src/adaptive-run.js'),X=require('../src/expansion.js');
const make=()=>new Run('ADAPT-BOUNDARY','standard',false,{}, {mode:'expedition',adaptive:true,airframe:'bastion'});
const ease={skill:'learning',adjustment:'ease',line:'More room.',rationale:'Recent hull loss.'};
test('disabled adaptive wrapper preserves authored expedition behavior',()=>{
 const a=new Run('UNCHANGED','standard'),b=new X.Run('UNCHANGED','standard');
 for(const w of [a,b]){w.chooseRoute('refuge');w.sign('mirror');}
 for(let n=0;n<240;n++)for(const w of [a,b]){w.step(1/120,{autoAim:true,shoot:true,mx:.5});w.takeEvents();}
 assert.deepEqual(a.p,b.p);assert.deepEqual(a.enemies,b.enemies);assert.deepEqual(a.bullets,b.bullets);assert.equal(a.diffSpeed,b.diffSpeed);
});
test('one encounter analysis applies once at boundary while preserving pact, hull, build and elapsed time',()=>{
 const w=make();w.chooseRoute('refuge');w.sign('mirror');assert.equal(w.applyAdaptation(1,ease),false);
 w.step(1/120,{});w.completeEncounter();const before={hp:w.p.hp,energy:w.p.energy,time:w.time,mods:{...w.mods},upgrades:{...w.upgrades},credits:w.credits};
 assert.equal(w.pendingAnalysis.sequence,1);assert.equal(w.applyAdaptation(1,ease,{provider:'openai',model:'gpt-5.6-luna'}),true);
 assert.deepEqual({hp:w.p.hp,energy:w.p.energy,time:w.time,mods:{...w.mods},upgrades:{...w.upgrades},credits:w.credits},before);
 assert.equal(w.diffSpeed,.92);assert.equal(w.adaptiveLevel,-1);assert.equal(w.applyAdaptation(1,ease),false);assert.equal(w.applyAdaptation(0,ease),false);
});
test('adaptation changes future projectile speed and authored spawn intervals with bounded levels',()=>{
 const w=make();w.chooseRoute('refuge');w.sign('mirror');w.completeEncounter();w.applyAdaptation(1,ease);
 const plan=w.formationPlan(),base=new X.Run('ADAPT-BOUNDARY','standard',false,{}, {mode:'expedition',airframe:'bastion'});base.chooseRoute('refuge');base.sign('mirror');
 assert.equal(plan.length,base.formationPlan().length);assert.equal(plan[0].at,1.25);assert.ok(Math.abs((plan[1].at-1.25)/(base.formationPlan()[1].at-1.25)-1.08)<1e-9);
 const b=w.bullet(10,20,0,100);assert.equal(b.vx,92);assert.equal(w.mods.reflect,2.2);assert.equal(w.mods.gun,.75);
 for(let n=2;n<=5;n++){w.pendingAnalysis={sequence:n,stage:1,wave:0,completion:'wave',telemetry:{}};w.applyAdaptation(n,ease);}
 assert.equal(w.adaptiveLevel,-2);assert.equal(w.diffSpeed,.84);
});
test('sector analysis uses the entire sector before boss heal; skipped analysis holds pressure',()=>{
 const w=make();w.chooseRoute('refuge');w.sign('mirror');w.kills=3;w.time=4;w.completeEncounter();w.skipAdaptation();w.chooseUpgrade(w.offers[0].id);
 w.kills=8;w.time=12;w.completeEncounter();w.skipAdaptation();w.chooseUpgrade(w.offers[0].id);
 w.kills=9;w.time=19;w.p.hp=4;w.completeEncounter();
 assert.equal(w.pendingAnalysis.completion,'sector');assert.equal(w.pendingAnalysis.telemetry.kills,9);assert.equal(w.pendingAnalysis.waveTelemetry.kills,1);assert.equal(w.pendingAnalysis.telemetry.seconds,19);assert.equal(w.pendingAnalysis.telemetry.hpRatio,Math.round(4/w.p.maxHp*1000)/1000);assert.equal(w.p.hp,6);
 w.skipAdaptation();assert.equal(w.adaptiveLevel,0);assert.equal(w.adaptiveHistory.length,3);assert.equal(w.adaptiveHistory.at(-1).provider,'local');
});
