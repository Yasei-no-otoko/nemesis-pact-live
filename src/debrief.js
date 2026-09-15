/* Bounded end-of-run flight debrief. Model output is descriptive only. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PactDebrief=api;})(globalThis,function(){'use strict';
 const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
 const modes=['classic','expedition','gauntlet'], outcomes=['won','dead'], difficulties=['assist','standard','veteran'];
 const UPGRADES=new Set(['scatter','rapid','rail','echo','parry','razor','orbit','magnet','hull','leech','homing','nova','repair']);
 const RELICS=new Set(['needle','capacitor','second','razor','echo','lens','nova','satellite']);
 const PACTS=new Set(['mercy','mirror','glass','silence','duel','sanctuary','velocity']);
 const ID=/^[A-Za-z0-9_-]{1,48}$/;
 const finite=(n,min,max)=>typeof n==='number'&&Number.isFinite(n)&&n>=min&&n<=max;
 const ints=['seconds','kills','bossKills','totalStages','parries','grazes','damageTaken','score','hull','maxHull','pactsKept','pactsTotal','adaptiveLevel'];
 const ranges={seconds:[0,86400],kills:[0,100000],bossKills:[0,1000],totalStages:[1,6],parries:[0,100000],grazes:[0,100000],damageTaken:[0,100000],score:[0,100000000],hull:[0,1000],maxHull:[1,1000],pactsKept:[0,100],pactsTotal:[0,100],adaptiveLevel:[-2,2]};
 function arr(v,known){if(!Array.isArray(v)||v.length>64||v.some(x=>typeof x!=='string'||!ID.test(x)||!known.has(x)))throw Error('Invalid run identifiers');return [...new Set(v)];}
 function cleanRequest(x){
  if(!x||typeof x!=='object'||Array.isArray(x))throw Error('Expected an object');
  const keys=['runId','sequence','language','run'];if(Object.keys(x).length!==keys.length||Object.keys(x).some(k=>!keys.includes(k)))throw Error('Invalid debrief request');
  if(typeof x.runId!=='string'||!/^(?:[0-9a-f]{8}-[0-9a-f-]{9,36}|[A-Za-z0-9:_-]{1,120})$/i.test(x.runId))throw Error('Invalid runId');
  if(!Number.isSafeInteger(x.sequence)||x.sequence<1||x.sequence>18)throw Error('Invalid sequence');
  if(x.language!=='en'&&x.language!=='ja')throw Error('Invalid language');
  const r=x.run;if(!r||typeof r!=='object'||Array.isArray(r))throw Error('Invalid run');
  const rk=['mode','outcome','difficulty','autoplay',...ints,'upgradeIds','relicIds','pactIds'];if(Object.keys(r).length!==rk.length||Object.keys(r).some(k=>!rk.includes(k)))throw Error('Invalid run shape');
  if(!modes.includes(r.mode)||!outcomes.includes(r.outcome)||!difficulties.includes(r.difficulty)||typeof r.autoplay!=='boolean')throw Error('Invalid run metadata');
  const out={mode:r.mode,outcome:r.outcome,difficulty:r.difficulty,autoplay:r.autoplay};for(const k of ints){const [min,max]=ranges[k];if(!Number.isSafeInteger(r[k])||r[k]<min||r[k]>max)throw Error('Invalid run metric');out[k]=r[k];}
  if(out.hull>out.maxHull||out.pactsKept>out.pactsTotal||out.bossKills>out.totalStages||out.totalStages!==(out.mode==='classic'?3:6))throw Error('Invalid run totals');out.upgradeIds=arr(r.upgradeIds,UPGRADES);out.relicIds=arr(r.relicIds,RELICS);out.pactIds=arr(r.pactIds,PACTS);
  return {runId:x.runId,sequence:x.sequence,language:x.language,run:out};
 }
 const field=(max)=>({type:'string',minLength:1,maxLength:max});
 function schema(){return {type:'object',additionalProperties:false,required:['headline','summary','strength','improvement','nextRun'],properties:{headline:field(96),summary:field(360),strength:field(240),improvement:field(240),nextRun:field(240)}};}
 function validateDecision(x){if(!x||typeof x!=='object'||Array.isArray(x)||Object.keys(x).length!==5)return bad();for(const k of ['headline','summary','strength','improvement','nextRun'])if(typeof x[k]!=='string'||!x[k].trim()||x[k].length>{headline:96,summary:360,strength:240,improvement:240,nextRun:240}[k]||/[\u0000-\u001f]/.test(x[k]))return bad();return {...x};}
 function bad(){throw Error('Invalid debrief decision');}
 function mock(req){
  const clean=cleanRequest(req),r=clean.run,won=r.outcome==='won',comfortable=won&&r.hull/r.maxHull>.5&&r.damageTaken<r.maxHull;
  if(clean.language==='ja'){
   const mode={classic:'\u30af\u30e9\u30b7\u30c3\u30af',expedition:'\u9060\u5f81',gauntlet:'\u30dc\u30b9\u9023\u6226'}[r.mode];
   return validateDecision({headline:won?'\u98db\u884c\u5b8c\u4e86':'\u98db\u884c\u8a18\u9332',summary:`${mode}: \u30dc\u30b9\u6483\u7834 ${r.bossKills}/${r.totalStages}\u3001\u6226\u95d8\u6642\u9593${r.seconds}\u79d2\u3002\u6483\u7834${r.kills}\u3001\u88ab\u30c0\u30e1\u30fc\u30b8${r.damageTaken}\u3001\u6b8b\u308a\u8010\u4e45${r.hull}/${r.maxHull}\u3002${r.autoplay?'\u81ea\u52d5\u64cd\u7e26\u30c7\u30e2\u306e\u8a18\u9332\u3067\u3059\u3002':''}`,strength:`\u53cd\u5c04\u3057\u305f\u5f3e${r.parries}\u767a\u3001\u5c65\u884c\u3057\u305f\u5951\u7d04${r.pactsKept}/${r.pactsTotal}\u4ef6\u3092\u8a18\u9332\u3057\u307e\u3057\u305f\u3002`,improvement:r.damageTaken>0?`\u6b21\u306e\u51fa\u6483\u3067\u306f\u88ab\u30c0\u30e1\u30fc\u30b8${r.damageTaken}\u3092\u6e1b\u3089\u3059\u3053\u3068\u3092\u76ee\u6a19\u306b\u3067\u304d\u307e\u3059\u3002`:'\u8a18\u9332\u4e0a\u3001\u88ab\u30c0\u30e1\u30fc\u30b8\u306f\u3042\u308a\u307e\u305b\u3093\u3002\u7d30\u304b\u306a\u64cd\u4f5c\u306f\u96c6\u8a08\u5024\u3060\u3051\u3067\u306f\u8a55\u4fa1\u3067\u304d\u307e\u305b\u3093\u3002',nextRun:r.autoplay?'\u64cd\u4f5c\u3092\u5f15\u304d\u7d99\u3044\u3067\u540c\u3058\u6761\u4ef6\u3092\u8a66\u3057\u3001\u81ea\u5206\u306e\u8a18\u9332\u3068\u6bd4\u3079\u3066\u307f\u307e\u3057\u3087\u3046\u3002':comfortable?'\u96e3\u6613\u5ea6\u3092\u4e00\u6bb5\u968e\u4e0a\u3052\u308b\u304b\u3001\u5225\u306e\u88c5\u5099\u69cb\u6210\u3092\u8a66\u3057\u3066\u307f\u307e\u3057\u3087\u3046\u3002':'\u5b89\u5168\u306a\u4f4d\u7f6e\u53d6\u308a\u3092\u512a\u5148\u3057\u3001\u30c0\u30c3\u30b7\u30e5\u3068\u30d1\u30ea\u30a3\u3092\u7df4\u7fd2\u3057\u3066\u307f\u307e\u3057\u3087\u3046\u3002'});
  }
  return validateDecision({headline:won?'Flight complete':'Flight record',summary:`${r.mode}: ${r.bossKills}/${r.totalStages} bosses defeated in ${r.seconds}s of combat; ${r.kills} eliminations, ${r.damageTaken} hull lost, ${r.hull}/${r.maxHull} hull remaining. ${r.autoplay?'Autopilot demonstration.':''}`,strength:`Recorded ${r.parries} reflected bullets and ${r.pactsKept}/${r.pactsTotal} pacts kept.`,improvement:r.damageTaken>0?`Aim to reduce the ${r.damageTaken} hull points lost on your next flight.`:'No hull damage was recorded. Aggregate counters cannot establish exact movement skill.',nextRun:r.autoplay?'Take control under the same conditions and compare your own flight record.':comfortable?'Try one higher difficulty or a different equipment build.':'Prioritize safe positioning and practice dash and parry timing.'});
 }
 function fromWorld(w,patch={}){if(!w||!['won','dead'].includes(w.phase))throw Error('Debrief requires a finished run');const contracts=Array.isArray(w.contracts)?w.contracts:[],r={mode:w.mode||'classic',outcome:w.phase,difficulty:w.difficulty||'standard',autoplay:Boolean(w.autoplay),seconds:Math.round(w.time||0),kills:Math.round(w.kills||0),bossKills:Math.round(w.bossKills||w.bosses||0),totalStages:Math.max(1,Math.min(6,Math.round(w.totalStages||w.sectorCount||3))),parries:Math.round(w.parries||0),grazes:Math.round(w.grazes||0),damageTaken:Math.round(w.damageTaken||0),score:Math.round(w.score||0),hull:Math.max(0,Math.round(w.p?.hp||0)),maxHull:Math.max(1,Math.round(w.p?.maxHp||1)),pactsKept:contracts.filter(c=>c&&typeof c==='object'&&c.kept).length,pactsTotal:contracts.length,adaptiveLevel:Math.round(w.adaptiveLevel||0),upgradeIds:Object.keys(w.upgrades||{}),relicIds:Array.isArray(w.relics)?w.relics:[],pactIds:contracts.map(x=>typeof x==='string'?x:x?.id).filter(Boolean)};return cleanRequest({runId:patch.runId||'world-run',sequence:patch.sequence||1,language:patch.language||'en',run:{...r,...patch.run}});}
 return {modes,outcomes,difficulties,cleanRequest,schema,validateDecision,mock,localDecision:mock,fromWorld};
});
