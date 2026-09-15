'use strict';
const V=require('../src/covenant.js'),{pilot}=require('./simulate.js'),fs=require('node:fs');
const version=require('../package.json').version,out=process.env.NEMESIS_SIMULATION_OUT||'docs/validation-v'+version;
const result={build:version,method:'Fixed 120 Hz, full-state heuristic pilot; legal movement/shoot/parry/dash/Nova/breach and offered signatures only. No hull/boss HP/timer/progression edits. Not human difficulty evidence. Local rules; no AI inference.',runs:[]};
const prompts=['Move the sanctuary left. Slow bullets. I accept reinforcements.','Amplify reflections and slow fire. Weaker gun.','Put sanctuary on the right. I accept fragile hull.'];
for(const layout of ['desktop','portrait'])for(const difficulty of ['standard','veteran'])for(const prompt of prompts){
 const w=new V.Run('COVENANT-VALIDATION',difficulty,layout==='portrait'?{layout,height:1250}:{});let frames=0;
 while(!['won','dead'].includes(w.phase)&&frames<120*240){
  if(w.phase==='covenant'||w.phase==='parley'){const r=w.request(w.phase==='parley'?'Amplify reflections and slow fire. Weaker gun.':prompt);w.signCovenant(V.localProposal(r),{provider:'local-rules'},w.revision);}
  else{w.step(1/120,pilot(w));frames++;}w.takeEvents();
  if(!Number.isFinite(w.p.hp+w.p.x+w.time+w.score))throw Error('Non-finite simulation');
 }
 const r={...w.report(),layout,difficulty,initialPrompt:prompt,remainingHull:w.p.hp,frames};result.runs.push(r);console.log(layout,difficulty,r.outcome,r.seconds,r.remainingHull,r.covenantStats);
 if(!['won','dead'].includes(w.phase))process.exitCode=1;
}
result.won=result.runs.filter(r=>r.outcome==='won').length;result.total=result.runs.length;
fs.mkdirSync(out,{recursive:true});fs.writeFileSync(out+'/covenant-simulations.json',JSON.stringify(result,null,2));
