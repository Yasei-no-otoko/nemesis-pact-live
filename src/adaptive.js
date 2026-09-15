/* Bounded adaptive difficulty protocol. Model output never selects parameters. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PactAdaptive=api;})(globalThis,function(){'use strict';
 const ADJUSTMENTS=['ease','hold','raise'],SKILLS=['learning','steady','expert'];
 const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
 const finite=(n,min,max)=>typeof n==='number'&&Number.isFinite(n)&&n>=min&&n<=max;
 function cleanRequest(x){
  if(!x||typeof x!=='object'||Array.isArray(x))throw Error('Expected an object');
  const keys=['runId','sequence','mode','stage','wave','completion','difficulty','autoplay','currentLevel','telemetry'];
  if(Object.keys(x).some(k=>!keys.includes(k))||Object.keys(x).length!==keys.length)throw Error('Invalid adaptive request');
  if(typeof x.runId!=='string'||!/^[A-Za-z0-9:_-]{1,120}$/.test(x.runId))throw Error('Invalid runId');
  if(!Number.isSafeInteger(x.sequence)||x.sequence<1||x.sequence>18)throw Error('Invalid sequence');
  if(x.mode!=='expedition'||!Number.isSafeInteger(x.stage)||x.stage<0||x.stage>5||!Number.isSafeInteger(x.wave)||x.wave<0||x.wave>2||x.sequence!==x.stage*3+x.wave+1)throw Error('Invalid encounter');
  if(x.completion!==(x.wave===2?'sector':'wave')||!['assist','standard','veteran'].includes(x.difficulty))throw Error('Invalid completion or difficulty');
  if(typeof x.autoplay!=='boolean'||!Number.isInteger(x.currentLevel)||x.currentLevel<-2||x.currentLevel>2)throw Error('Invalid level');
  const t=x.telemetry;if(!t||typeof t!=='object'||Array.isArray(t))throw Error('Invalid telemetry');
  const allowed=['kills','parries','grazes','damageTaken','seconds','hpRatio'];
  if(Object.keys(t).length!==allowed.length||Object.keys(t).some(k=>!allowed.includes(k)))throw Error('Telemetry must contain all fields');
  const telemetry={};
  for(const k of allowed){if(!own(t,k))throw Error('Missing telemetry');const range=k==='hpRatio'?[0,1]:k==='seconds'?[0,3600]:[0,100000];if(!finite(t[k],...range))throw Error('Invalid telemetry value');telemetry[k]=k==='hpRatio'||k==='seconds'?Math.round(t[k]*100)/100:Math.round(t[k]);}
  return {runId:x.runId,sequence:x.sequence,mode:x.mode,stage:x.stage,wave:x.wave,completion:x.completion,difficulty:x.difficulty.slice(0,48),autoplay:x.autoplay,currentLevel:x.currentLevel,telemetry};
 }
 function schema(){return {type:'object',additionalProperties:false,required:['skill','adjustment','line','rationale'],properties:{skill:{type:'string',enum:SKILLS},adjustment:{type:'string',enum:ADJUSTMENTS},line:{type:'string',minLength:1,maxLength:180},rationale:{type:'string',minLength:1,maxLength:300}}};}
 function validateDecision(x){
  if(!x||typeof x!=='object'||Array.isArray(x)||Object.keys(x).length!==4||!['skill','adjustment','line','rationale'].every(k=>own(x,k)))throw Error('Invalid adaptive decision shape');
  if(!SKILLS.includes(x.skill)||!ADJUSTMENTS.includes(x.adjustment)||typeof x.line!=='string'||!x.line.trim()||x.line.length>180||typeof x.rationale!=='string'||!x.rationale.trim()||x.rationale.length>300)throw Error('Invalid adaptive decision');
  if(/[\u0000-\u001f]/.test(x.line+x.rationale))throw Error('Control characters are not allowed');
  return {skill:x.skill,adjustment:x.adjustment,line:x.line,rationale:x.rationale};
 }
 function mock(r){return validateDecision({skill:'steady',adjustment:'hold',line:'The encounter stays at its current pace.',rationale:'LOCAL RULES hold because adaptive analysis is unavailable; authored difficulty remains unchanged.'});}
 function apply(request,decision){const r=cleanRequest(request),d=validateDecision(decision),step=d.adjustment==='ease'?-1:d.adjustment==='raise'?1:0;const level=Math.max(-2,Math.min(2,r.currentLevel+step));return {level,adjustment:d.adjustment,modifiers:{bulletSpeed:1+level*.08,spawnSpacing:1-level*.08},runId:r.runId,sequence:r.sequence};}
 return {SKILLS,ADJUSTMENTS,cleanRequest,schema,validateDecision,mock,apply};
});
