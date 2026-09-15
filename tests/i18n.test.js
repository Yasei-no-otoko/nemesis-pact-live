'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),L=require('../src/i18n.js');
test('explicit language wins over browser preference',()=>{
  assert.equal(L.resolveLocale('en',['ja-JP','en-US']),'en');
  assert.equal(L.resolveLocale('ja',['en-US']),'ja');
});
test('first supported browser language selects the initial UI with English fallback',()=>{
  assert.equal(L.resolveLocale(null,['ja-JP','en']),'ja');
  assert.equal(L.resolveLocale(null,['en-US','ja']),'en');
  assert.equal(L.resolveLocale('invalid',['fr','JA_jp']),'ja');
  assert.equal(L.resolveLocale(null,['fr-FR']),'en');
  assert.equal(L.resolveLocale(null,[]),'en');
});
test('language changes only the presentation and preserves original English',()=>{
  assert.equal(L.translate('  Settings  ','ja'),'  設定  ');
  assert.equal(L.translate('Settings','en'),'Settings');
  assert.equal(L.translate('CUSTOM_PLAYER_SEED_2026','ja'),'CUSTOM_PLAYER_SEED_2026');
  assert.equal(L.translate('gpt-5.6-luna','ja'),'gpt-5.6-luna');
  assert.equal(L.setLocale('fr'),false);
});
test('dynamic translation preserves full numeric capture groups',()=>{
  assert.equal(L.translate('BEST 104,920','ja'),'最高記録 104,920');
  const wave=L.translate('WAVE 02 / 12','ja');assert.match(wave,/02/);assert.match(wave,/12/);assert.doesNotMatch(wave,/undefined/);
  const phase=L.translate('PHASE 03 / 27%','ja');assert.match(phase,/03/);assert.match(phase,/27%/);
  const delay=L.translate('2436 ms','ja');assert.equal(delay,'2436 ms');
});

test('composite labels translate without losing rule provenance, values or revision',()=>{
  assert.equal(L.translate('CONTRACT: LOCAL RULES / NO AI INFERENCE','ja'),'契約: LOCAL RULES / AI推論なし');
  assert.equal(L.translate('REV 03 / Left-side Covenant','ja'),'改訂 03 / 左側の安全地帯の契約');
  const status=L.translate('Offline rehearsal; no AI request. 13 ms · 2/3 rule budget · NOT YET APPLIED.','ja');
  assert.match(status,/13 ms/);assert.match(status,/2\/3/);assert.doesNotMatch(status,/Offline|undefined/);
  const note=L.translate('SECTOR 6 / WAVE 3. Actual scheduled enemies for this route; choosing another route changes the count. Formation persists until changed. Boss attacks, hull and pact rules stay fixed.','ja');
  assert.match(note,/セクター 6 \/ ウェーブ 3/);assert.doesNotMatch(note,/Actual|undefined/);
});

test('Japanese authored campaign suggestions retain their canonical pact in LOCAL RULES',()=>{
  const C=require('../src/core.js'),I=require('../src/intelligence.js');
  for(const pact of C.CONTRACTS){
    const english=pact.line.replace(/[“”]/g,''),prompt=L.translate(english,'ja');
    assert.notEqual(prompt,english,pact.id+' suggestion must be Japanese');
    const decision=I.mock({task:'negotiate',prompt,seed:'JA-CATALOG',stage:0,allowed:C.CONTRACTS.map(c=>c.id),telemetry:{}});
    assert.equal(decision.contractId,pact.id,prompt);
  }
});
test('Japanese local Director requests still choose bounded catalog formations',()=>{
  const I=require('../src/intelligence.js');
  for(const [prompt,want]of [['バランスのよい編成にして','balanced'],['追尾する編成にしてください','pursuit'],['十字砲火の格子で','crossfire']]){
    const d=I.mock({task:'director',prompt,seed:'JA-DIRECTOR',stage:0,allowed:['mercy','mirror','glass'],telemetry:{}});assert.equal(d.directorId,want);
  }
});
