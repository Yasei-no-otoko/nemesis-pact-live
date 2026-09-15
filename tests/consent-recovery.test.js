'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),I=require('../src/i18n.js');
const source=fs.readFileSync(require.resolve('../src/game.js'),'utf8');
function fn(name,next){const start=source.indexOf('  async function '+name+'('),end=source.indexOf('  '+next,start);assert.ok(start>=0&&end>start);return source.slice(start,end);}
function harness(){
  const nodes=new Map(),node=id=>{if(!nodes.has(id))nodes.set(id,{value:'',checked:false,disabled:false,hidden:false,textContent:'',open:false,dataset:{},showModal(){assert.equal(this.open,false);this.open=true;}});return nodes.get(id);};
  node('cv-mode').value='server';
  const world={revision:0,request(){throw Error('must not construct or send request without consent');}};
  const context={$:node,world,cvWorld:world,cvSigning:false,screen:'covenant-screen',T:s=>I.translate(s,'ja'),window:{NEMESIS_HOSTED:true},document:{querySelector:()=>node('voice')},voice:{stop(){}},voiceActive:false,cvSession:{ensure:async()=>({contractEnabled:true,voiceEnabled:true})}};
  vm.createContext(context);vm.runInContext(fn('proposeCovenant','async function signCovenant')+fn('refreshConnection','function setupVoice'),context);
  return {context,node};
}
test('no-consent counteroffer opens consent dialog without sending or signing',async()=>{
  const {context:c,node}=harness();assert.equal(await c.proposeCovenant(),null);assert.equal(node('cv-connection-dialog').open,true);assert.equal(node('cv-consent').checked,false);assert.equal(c.world.revision,0);assert.match(node('cv-session-status').textContent,/この要求はまだ送信していません/);
  assert.equal(await c.proposeCovenant(),null); // already-open dialog is safe
});
test('signing or leaving the negotiation never opens a new dialog',async()=>{
  const {context:c,node}=harness();c.cvSigning=true;await c.proposeCovenant();assert.equal(node('cv-connection-dialog').open,false);
  c.cvSigning=false;c.screen='game';await c.proposeCovenant();assert.equal(node('cv-connection-dialog').open,false);
});
test('explicit local escape remains visible with consent, service outage or closed budget',async()=>{
  const {context:c,node}=harness();node('cv-consent').checked=true;
  await c.refreshConnection();assert.equal(node('cv-local-quick').hidden,false);
  c.cvSession.ensure=async()=>{throw Error('offline');};await c.refreshConnection();assert.equal(node('cv-local-quick').hidden,false);assert.match(node('cv-session-status').textContent,/Select LOCAL RULES/);
  c.cvSession.ensure=async()=>({contractEnabled:false,voiceEnabled:false});await c.refreshConnection();assert.equal(node('cv-local-quick').hidden,false);assert.equal(node('cv-voice-start').disabled,true);
});
test('local mode hides redundant shortcut and never creates an online session',async()=>{
  const {context:c,node}=harness();node('cv-mode').value='local';c.cvSession.ensure=async()=>{throw Error('must not call');};await c.refreshConnection();assert.equal(node('cv-local-quick').hidden,true);assert.equal(node('cv-voice-start').disabled,true);
});
test('consent guidance has complete Japanese copy and preserves English',()=>{
  const text='Review the data-sharing consent, or choose LOCAL RULES. This request has not been sent.';assert.equal(I.translate(text,'en'),text);assert.match(I.translate(text,'ja'),/LOCAL RULES/);assert.doesNotMatch(I.translate(text,'ja'),/Review|This request/);
});
