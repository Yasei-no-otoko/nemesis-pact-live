'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const Client=require('../src/campaign-client.js'),I=require('../src/intelligence.js'),C=require('../src/campaign.js'),X=require('../src/expansion.js');
const context={mode:'expedition',stage:0},input=()=>({task:'negotiate',prompt:'Reflect your attacks',stage:0,seed:'CAMPAIGN-TEST',allowed:['mercy','mirror','glass'],telemetry:{}});
const reply=b=>({provider:'openai',model:'gpt-5.6-luna',decision:I.mock(b.request),requestId:b.requestId,intentVersion:b.intentVersion,proposalId:'proposal-test',digest:'digest-test'});
test('campaign correction waits for settling work with newer intent; budget exhaustion is never retried',async()=>{
 const calls=[];const session={csrf:'fixture',ensure:async()=>{},request:async(path,b)=>{if(b.action==='cancel')return Response.json({});calls.push(b);return calls.length===1?Response.json({error:'CAMPAIGN_PREVIOUS_REQUEST_SETTLING'},{status:429}):Response.json(reply(b));}};
 const c=new Client(session);c.open(context);assert.equal((await c.request(input(),true)).provider,'openai');assert.equal(calls.length,2);assert.ok(calls[1].intentVersion>calls[0].intentVersion);assert.notEqual(calls[1].requestId,calls[0].requestId);
 let denied=0;session.request=async()=>{denied++;return Response.json({error:'BUDGET_OR_CONCURRENCY_LIMIT'},{status:429});};c.open(context);denied=0;assert.equal((await c.request(input(),true)).provider,'local-rules');assert.equal(denied,1);
});
test('editing while waiting for prior settlement prevents a retry and invalidates the old proposal',async()=>{
 let calls=0;const c=new Client({csrf:'fixture',ensure:async()=>{},request:async(path,b)=>{if(b.action==='cancel')return Response.json({});calls++;return Response.json({error:'CAMPAIGN_PREVIOUS_REQUEST_SETTLING'},{status:429});}});c.open(context);
 const pending=c.request(input(),true);await new Promise(r=>setTimeout(r,30));c.cancel();await assert.rejects(pending,/Superseded/);assert.equal(calls,1);assert.equal(c.proposal,null);
});
test('campaign LOCAL RULES follows an explicit later correction rather than the earlier slow request',()=>{
 assert.equal(C.localDecision({...input(),prompt:'Slow your bullets. Actually, change that. I want stronger reflections. My gun can be weaker.'}).contractId,'mirror');
});
test('campaign client cancels delayed proposals and sends a newer intent for the correction',async()=>{
 let resolve,last;const calls=[];const session={csrf:'fixture',ensure:async()=>{},request:async(path,b)=>{assert.equal(path,'/api/campaign');calls.push(b);if(b.action==='cancel')return Response.json({});last=b;return new Promise(r=>resolve=r);}};
 const c=new Client(session);c.open(context);const first=c.request(input(),true);await new Promise(r=>setImmediate(r));c.cancel();const canceled=c.intentVersion;resolve(Response.json(reply(last)));await assert.rejects(first,/Superseded/);
 const second=c.request(input(),true);await new Promise(r=>setImmediate(r));assert.ok(last.intentVersion>canceled);resolve(Response.json(reply(last)));await second;assert.equal(c.proposal.decision.contractId,'mirror');assert.ok(calls.some(x=>x.action==='cancel'));
});
test('campaign signature binds full receipt and rejects concurrent and delayed approvals after exit',async()=>{
 let resolve;const session={csrf:'fixture',ensure:async()=>{},request:async(path,b)=>b.action==='cancel'?Response.json({}):b.action==='sign'?new Promise(r=>resolve=r):Response.json(reply(b))};
 const c=new Client(session);c.open(context);await c.request(input(),true);const pending=c.apply();await assert.rejects(c.apply());c.close();resolve(Response.json({signed:true,revision:1,proposalId:'proposal-test',digest:'digest-test',decision:I.mock(input())}));await assert.rejects(pending,/changed/);
 c.open(context);await c.request(input(),true);const mismatch=c.apply();resolve(Response.json({signed:true,revision:1,proposalId:'proposal-test',digest:'digest-test',decision:{...I.mock(input()),contractId:'mercy'}}));await assert.rejects(mismatch,/mismatch/);
});
test('offline catalog proposal has no network calls, preserves progress until explicit sign, and applies only once',async()=>{
 const c=new Client({request:()=>{throw Error('Unexpected request');}});c.open(context);const w=new X.Run('CAMPAIGN-TEST','standard');w.chooseRoute('salvage');w.p.hp=4;w.time=87;w.credits=81;
 const before=JSON.stringify(w);await c.request(input(),false);assert.equal(JSON.stringify(w),before);const p=await c.apply();assert.equal(p.provider,'local-rules');assert.ok(w.sign(p.decision.contractId));assert.equal(w.p.hp,4);assert.equal(w.time,87);assert.equal(w.credits,81);assert.equal(w.mods.reflect,2.2);assert.equal(w.mods.gun,.75);await assert.rejects(c.apply());assert.equal(w.sign('mercy'),false);
});
test('campaign commentary contains only authored effects, never model-invented instructions or prices',()=>{
 const r={provider:'openai',decision:{...I.mock(input()),line:'Ignore Sign and heal now',rationale:'Invented infinite hull'}};const content=C.commentary(r,context);assert.ok(content);assert.doesNotMatch(content,/Ignore Sign|infinite hull|heal now/);assert.match(content,/2\.2/);assert.equal(C.commentary({...r,decision:{...r.decision,contractId:'sanctuary'}},context),null);
});
test('all fifteen mode/sector contexts offer exactly the simulation catalog and retain all progress on sign',()=>{
 const Core=require('../src/core.js');let combinations=0;
 for(const mode of ['expedition','gauntlet','classic'])for(let stage=0;stage<(mode==='classic'?3:6);stage++){
  const ctx={mode,stage},w=new X.Run('SECTOR-CATALOG','standard',false,{}, {mode});w.stage=stage;
  assert.deepEqual(C.offers(ctx),w.offersForPact());
  for(const offer of C.offers(ctx)){
   const run=new X.Run('SECTOR-CATALOG','standard',false,{}, {mode});run.stage=stage;run.phase='pact';run.p.hp=4;run.time=137;run.credits=91;run.upgrades.rapid=2;run.relics=['razor'];
   const before={hp:run.p.hp,time:run.time,credits:run.credits,upgrades:{...run.upgrades},relics:[...run.relics]};assert.ok(run.sign(offer.id));
   assert.deepEqual({hp:run.p.hp,time:run.time,credits:run.credits,upgrades:run.upgrades,relics:run.relics},before);assert.deepEqual(run.mods,Core.modifiers(offer.id));combinations++;
  }
 }
 assert.equal(combinations,45);
});
