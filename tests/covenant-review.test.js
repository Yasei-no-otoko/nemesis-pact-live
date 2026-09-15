'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const V=require('../src/covenant.js'),R=require('../src/covenant-review.js'),I=require('../src/i18n.js');
function allSpecs(){const out=[];for(const zone of V.ZONES)for(const speed of V.SPEEDS)for(const reflection of V.REFLECTS)for(const price of V.PRICES){const s={version:1,title:'Review fixture',zone,speed,reflection,price,line:'Fixture.',rationale:'Fixture.'};if(V.budget(s).valid)out.push(s);}return out;}
function start(spec=allSpecs()[0]){const w=new V.Run('REVIEW');assert.ok(w.signCovenant(spec));return w;}
test('all 36 signed deals round-trip through editable EN and JA keep-terms prompts',()=>{
  for(const spec of allSpecs())for(const language of ['en','ja']){
    const prompt=R.promptFor(spec).split(/(?<=\.)\s+/).map(part=>I.translate(part,language)).join(' ');
    const actual=V.localProposal(new V.Run('PROMPT').request(prompt));
    for(const key of ['zone','speed','reflection','price'])assert.equal(actual[key],spec[key],language+': '+prompt+' / '+key);
  }
});
test('comparison exposes removed benefits and replaced prices, including unchanged terms',()=>{
  const w=new V.Run('DIFF'),old=V.localProposal(w.request('Left sanctuary. Slow bullets. Reinforcements.'));
  const next=V.localProposal(w.request('No sanctuary. Slow bullets. Reflections. Weaker gun.'));
  const rows=R.compare(old,next);
  assert.deepEqual(rows.map(r=>r.changed),[true,false,true,true]);
  assert.equal(rows[0].before,'Left sanctuary');assert.equal(rows[0].after,'No sanctuary');
  assert.equal(rows[3].after,'Your gun damage −35%');
  assert.ok(R.compare(old,old).every(r=>!r.changed));assert.throws(()=>R.compare(old,{...next,zone:'everywhere'}));
});
test('briefing reads real interception and damage counters without changing the paused fight',()=>{
  const w=start(V.localProposal(new V.Run('R').request('Left sanctuary. Slow bullets. Reinforcements.'))),z=w.zone();
  w.protectBullet({px:z.x-100,py:z.y,x:z.x+100,y:z.y});
  const boss=w.enemies[0];boss.spawn=0;w.hitEnemy(boss,250,'reflect');w.p.inv=0;w.hurt();w.time=9;w.requestParley();
  const before=JSON.stringify(w),r=R.briefing(w);
  assert.equal(r.shielded,1);assert.equal(r.returned,250);assert.equal(r.hull,w.p.hp);assert.equal(r.bossRemaining,Math.ceil(boss.hp/boss.maxHp*100));assert.equal(r.recommendation,'reflect');
  assert.equal(JSON.stringify(w),before);assert.equal(w.revision,1);assert.equal(w.amendments,1);
});
test('fragile damage suggests a funded sanctuary trade with no double-damage penalty',()=>{
  const w=start(V.localProposal(new V.Run('F').request('Right sanctuary. Reflect. Double the damage I take.')));
  w.p.inv=0;w.hurt();const b=R.briefing(w),choice=b.choices.find(c=>c.id===b.recommendation);
  assert.equal(choice.id,'shelter');const s=V.localProposal(w.request(choice.prompt));
  assert.equal(s.zone,'right');assert.equal(s.price,'weaker_gun');assert.equal(V.compile(s).damage,1);assert.ok(V.budget(s).valid);
});
test('already-charged reflections never promise an additional unavailable upgrade',()=>{
  const w=start(V.localProposal(new V.Run('CHARGED').request('No sanctuary. Slow fire. Amplify reflections. Weaker gun.')));
  const boss=w.enemies[0];boss.spawn=0;w.hitEnemy(boss,100,'reflect');
  const b=R.briefing(w);assert.equal(b.recommendation,'keep');assert.match(b.observation,/enhanced reflections/);assert.doesNotMatch(b.observation,/strengthen them/);
  const terms=V.localProposal(w.request(b.choices.find(c=>c.id===b.recommendation).prompt));
  assert.equal(V.compile(terms).reflect,1.8);assert.ok(R.compare(w.spec,terms).every(row=>!row.changed));
  const sheltered=start(V.localProposal(new V.Run('CHARGED-SHIELD').request('Left sanctuary. Amplify reflections. Reinforcements.'))),z=sheltered.zone();
  sheltered.protectBullet({px:z.x-100,py:z.y,x:z.x+100,y:z.y});
  assert.equal(R.briefing(sheltered).recommendation,'keep');assert.doesNotMatch(R.briefing(sheltered).observation,/stronger reflections/);
});
test('briefing reports only effects since current signature and zero boss HP after actual victory',()=>{
  const w=start();w.covenantStats.reflectedDamage=100;w.time=9;w.requestParley();w.signCovenant(V.localProposal(w.request('Left sanctuary. Weaker gun.')));
  const b=w.enemies[0];b.spawn=0;w.hitEnemy(b,200,'reflect');assert.equal(R.briefing(w).returned,200);
  w.hitEnemy(b,b.hp,'shot');w.step(1/120,{});assert.equal(R.briefing(w).bossRemaining,0);
  assert.equal(R.briefing({mode:'expedition'}),null);
});
