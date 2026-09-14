'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),V=require('../src/covenant.js');
const {modelSchema,decodeModelContract,ruleSetId,explicitCorrectionZone}=require('../server/covenant-model.mjs');
const prose={version:1,title:'A fair covenant',line:'Review the binding terms.',rationale:'Only displayed clauses apply.'};
test('every affordable rule combination is offered and no unfunded combination can be generated',()=>{
 const offered=new Set(modelSchema().properties.ruleSet.enum);let valid=0;
 for(const zone of V.ZONES)for(const speed of V.SPEEDS)for(const reflection of V.REFLECTS)for(const price of V.PRICES){
  const clauses={zone,speed,reflection,price},id=ruleSetId(clauses);
  assert.equal(offered.has(id),V.budget(clauses).valid);
  if(V.budget(clauses).valid){valid++;const spec=decodeModelContract({...prose,ruleSet:id});assert.deepEqual(V.compile(spec),V.compile({...prose,...clauses}));}
 }
 assert.equal(offered.size,valid);assert.equal(valid,36);
});
test('the recorded Japanese correction constrains generation and rejects a late left response',()=>{
 const request={prompt:'\u5de6\u3092\u5b89\u5168\u306b\u3057\u3066\u3084\u3063\u3071\u308a\u53f3\u306b\u3057\u3066'};
 assert.equal(explicitCorrectionZone(request.prompt),'right');
 const offered=modelSchema(request).properties.ruleSet.enum;assert.equal(offered.length,8);assert.ok(offered.every(id=>id.startsWith('zone=right,')));
 const left=ruleSetId({zone:'left',speed:'normal',reflection:'normal',price:'weaker_gun'});
 assert.throws(()=>decodeModelContract({...prose,ruleSet:left},request),/ignored/);
});
test('clear English corrections are constrained while negated or ambiguous location mentions are not',()=>{
 assert.equal(explicitCorrectionZone('Left. Actually, make the right side safe.'),'right');
 assert.equal(explicitCorrectionZone('Right. I mean left.'),'left');
 assert.equal(explicitCorrectionZone("Actually, don't put it on the right."),null);
 assert.equal(explicitCorrectionZone('Actually, keep left and avoid right.'),null);
 assert.equal(explicitCorrectionZone('Actually, my right arrow is broken.'),null);
 assert.equal(explicitCorrectionZone('\u3084\u3063\u3071\u308a\u53f3\u306b\u3057\u306a\u3044\u3067'),null);
});
test('explicit sanctuary withdrawal constrains the model to none and rejects a retained old zone',()=>{
 for(const prompt of ['安全は撤回。その代わり敵の弾を遅く','安全は撤回その代わり敵の弾を遅く','結界を撤回して。弾を遅くして','結界なし。反射を強く','Withdraw the sanctuary and slow fire','No sanctuary. Slow fire.']){
  const request={prompt};assert.equal(explicitCorrectionZone(prompt),'none',prompt);
  assert.ok(modelSchema(request).properties.ruleSet.enum.every(id=>id.startsWith('zone=none,')),prompt);
  const retained=ruleSetId({zone:'right',speed:'slow',reflection:'normal',price:'reinforcements'});
  assert.throws(()=>decodeModelContract({...prose,ruleSet:retained},request),/ignored/);
  const removed=ruleSetId({zone:'none',speed:'slow',reflection:'normal',price:'weaker_gun'});
  assert.equal(decodeModelContract({...prose,ruleSet:removed},request).zone,'none');
 }
});
test('sanctuary removal constraints do not override negation, hypotheticals or later restoration',()=>{
 for(const prompt of ['安全は撤回しないで','もし安全を撤回するなら','Do not remove the sanctuary','Remove the sanctuary?','結界なし。その後は右側を安全にして','Withdraw the sanctuary and keep the right side safe','結界なし。結界を残して'])assert.equal(explicitCorrectionZone(prompt),null,prompt);
 assert.equal(explicitCorrectionZone('結界なし。やっぱり右にして'),'right');
 assert.equal(explicitCorrectionZone('やっぱり右にして。安全は撤回。その代わり敵の弾を遅く'),'none');
});
test('the reproduced right sanctuary plus charged reflection with weaker gun is rejected before canonical proposal creation',()=>{
 const bad=ruleSetId({zone:'right',speed:'normal',reflection:'charged',price:'weaker_gun'});
 assert.ok(!modelSchema().properties.ruleSet.enum.includes(bad));assert.throws(()=>decodeModelContract({...prose,ruleSet:bad}),/Unsupported/);
});
test('model prose cannot inject extra clauses and canonical validation still bounds all fields',()=>{
 const ruleSet=ruleSetId({zone:'right',speed:'normal',reflection:'normal',price:'weaker_gun'}),good={...prose,ruleSet};
 assert.throws(()=>decodeModelContract({...good,reflection:'charged'}));assert.throws(()=>decodeModelContract({...good,title:'x'.repeat(49)}));assert.throws(()=>decodeModelContract({...good,version:2}));
 assert.equal(decodeModelContract({...good,line:'You are invincible.'}).zone,'right');assert.equal(V.compile(decodeModelContract(good)).gun,.65);
});
