/* Encounter boundaries collect aggregate results. Signed pact modifiers stay canonical. */
(function(root,factory){const node=typeof module==='object'&&module.exports;const api=factory(node?require('./expansion.js'):root.PactExpansion);if(node)module.exports=api;else root.PactAdaptiveRun=api;})(globalThis,function(X){'use strict';
 const counters=w=>({kills:w.kills,parries:w.parries,grazes:w.grazes,damageTaken:w.damageTaken,seconds:w.time});
 const delta=(w,start)=>Object.fromEntries(Object.entries(counters(w)).map(([k,v])=>[k,Math.round(Math.max(0,v-(start?.[k]||0))*100)/100]));
 const modifiers=level=>({bulletSpeed:1+level*.08,spawnSpacing:1-level*.08});
 class Run extends X.Run{
  constructor(seed,difficulty,training=false,viewport={},options={}){super(seed,difficulty,training,viewport,options);this.adaptiveEnabled=options.adaptive===true&&this.mode==='expedition'&&!training;this.autoplay=options.autoplay===true&&!training;this.adaptiveLevel=0;this.baseBulletSpeed=this.diffSpeed;this.encounterResults=[];this.adaptiveHistory=[];this.pendingAnalysis=null;this.encounterStart=null;this.sectorStart=null;}
  startWave(){if(this.wave===0)this.sectorStart=counters(this);this.encounterStart=counters(this);super.startWave();}
  formationPlan(...args){const plan=super.formationPlan(...args),spacing=modifiers(this.adaptiveLevel||0).spawnSpacing;return plan.map(p=>({...p,at:1.25+(p.at-1.25)*spacing}));}
  completeEncounter(){
   if(this.mode==='expedition'&&!this.training){const report={sequence:this.encounterResults.length+1,stage:this.stage,wave:this.wave,completion:this.wave===2?'sector':'wave',telemetry:{...delta(this,this.wave===2?this.sectorStart:this.encounterStart),hpRatio:Math.round(this.p.hp/this.p.maxHp*1000)/1000},waveTelemetry:{...delta(this,this.encounterStart),hpRatio:Math.round(this.p.hp/this.p.maxHp*1000)/1000},level:this.adaptiveLevel};this.encounterResults.push(report);if(this.adaptiveEnabled)this.pendingAnalysis=report;}
   super.completeEncounter();
  }
  applyAdaptation(sequence,decision,source={}){
   const pending=this.pendingAnalysis;if(!pending||pending.sequence!==sequence||this.phase==='combat'||!this.adaptiveEnabled||!['ease','hold','raise'].includes(decision?.adjustment)||!['learning','steady','expert'].includes(decision?.skill))return false;
   const before=this.adaptiveLevel,after=Math.max(-2,Math.min(2,before+(decision.adjustment==='ease'?-1:decision.adjustment==='raise'?1:0)));
   this.adaptiveLevel=after;this.diffSpeed=this.baseBulletSpeed*modifiers(after).bulletSpeed;
   this.adaptiveHistory.push({sequence,stage:pending.stage,wave:pending.wave,completion:pending.completion,telemetry:{...pending.telemetry},before,after,skill:decision.skill,adjustment:decision.adjustment,line:String(decision.line||'').slice(0,340),rationale:String(decision.rationale||'').slice(0,600),provider:source.provider==='openai'?'openai':'local',model:source.provider==='openai'?source.model:null,latencyMs:source.latencyMs||0,modifiers:modifiers(after)});
   this.pendingAnalysis=null;return true;
  }
  skipAdaptation(){if(!this.pendingAnalysis)return false;return this.applyAdaptation(this.pendingAnalysis.sequence,{skill:'steady',adjustment:'hold',line:'Current pressure retained.',rationale:'Analysis skipped or unavailable.'},{provider:'local'});}
  report(){return {...super.report(),autoplay:this.autoplay,adaptive:{enabled:this.adaptiveEnabled,level:this.adaptiveLevel,modifiers:modifiers(this.adaptiveLevel),history:this.adaptiveHistory.map(x=>({...x,telemetry:{...x.telemetry},modifiers:{...x.modifiers}}))},encounterResults:this.encounterResults.map(x=>({...x,telemetry:{...x.telemetry},waveTelemetry:{...x.waveTelemetry}}))};}
 }
 return {Run,modifiers};
});
