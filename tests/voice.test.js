'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{PactVoice,canonical}=require('../src/voice.js');
class DC{constructor(){this.readyState='open';this.sent=[];this.l={};}addEventListener(k,f){(this.l[k]??=[]).push(f);}send(x){this.sent.push(JSON.parse(x));}close(){this.readyState='closed';}emit(e){for(const f of this.l.message||[])f({data:JSON.stringify(e)});}}
class PC{constructor(){this.dc=new DC();this.l={};this.connectionState='connected';this.iceGatheringState='complete';}addEventListener(k,f){(this.l[k]??=[]).push(f);}addTrack(t,s){this.track=t;this.stream=s;}async createOffer(){return{type:'offer',sdp:'v=0\r\noffer'};}async setLocalDescription(x){this.localDescription=x;}async setRemoteDescription(x){this.remoteDescription=x;}createDataChannel(){return this.dc;}emit(k,x={}){for(const f of this.l[k]||[])f(x);}close(){this.connectionState='closed';}}
function fixture({response,request}={}){const calls=[],track={enabled:true,stop(){this.stopped=true;}},stream={getTracks:()=>[track],getAudioTracks:()=>[track]},document={visibilityState:'visible',listeners:{},addEventListener(k,f){this.listeners[k]=f;},removeEventListener(k){delete this.listeners[k];}};const req=request||(async(url,body)=>{calls.push({url,body});return{ok:true,status:200,json:async()=>response||(url.endsWith('/start')?{sessionId:'live_test_1',sdp:'v=0\r\nanswer',maxDurationMs:45000}:{stopped:true})};});return{calls,track,stream,document,request:req,media:{getUserMedia:async()=>stream}};}
const wait=ms=>new Promise(r=>setTimeout(r,ms)),active=[];
function voice(e,extra={}){const v=new PactVoice({request:e.request,mediaDevices:e.media,RTCPeerConnection:PC,document:e.document,...extra});v.delegationDelayMs=0;return v;}
test.after(async()=>{for(const v of active.splice(0))await v.stop('test-cleanup');});
test('Live lifecycle uses session.started, raw captions, dedupe, canonical commentary and cleanup',async()=>{const e=fixture(),captions=[],inputs=[],v=voice(e,{onCaption:x=>captions.push(x),onInput:x=>inputs.push(x),onDelegation:async()=>({proposal:{version:1,title:'Pact',zone:'right',speed:'normal',reflection:'charged',price:'fragile',ignored:'x'},provider:'live'})});active.push(v);assert.equal(await v.start({runId:'run_123',revision:0}),true);assert.equal(v.state,'starting');v.dc.emit({type:'session.started',event_id:'started_1',session:{id:'live_test_1'}});v.dc.emit({type:'session.input_transcript.delta',event_id:'input_1',delta:'right',start_ms:1,end_ms:2});v.dc.emit({type:'session.input_transcript.delta',event_id:'input_1',delta:'right',start_ms:1,end_ms:2});v.dc.emit({type:'session.delegation.created',event_id:'delegation_1',delegation:{id:'delegation_1'}});await wait(10);assert.equal(captions.length,1);assert.equal(inputs.length,1);assert.equal(v.dc.sent.at(-1).type,'session.commentary.append');assert.deepEqual(JSON.parse(v.dc.sent.at(-1).content),{status:'unsigned',provider:'live',covenant:{version:1,title:'Pact',zone:'right',speed:'normal',reflection:'charged',price:'fragile'},instruction:'Only these displayed clauses are available. Ask the player to review and click Sign.'});await v.stop('signed');assert.equal(e.track.stopped,true);assert.ok(e.calls.some(c=>c.url==='/api/voice/stop'));});
test('supersede invalidates late delegation only; later transcripts still arrive',async()=>{const e=fixture(),inputs=[];let resolve;const v=voice(e,{onInput:x=>inputs.push(x),onDelegation:()=>new Promise(r=>{resolve=r;})});active.push(v);await v.start();v.dc.emit({type:'session.started',event_id:'s2'});v.dc.emit({type:'session.delegation.created',event_id:'d2',delegation:{id:'late_delegation'}});await wait(10);v.supersede();resolve({version:1,title:'Old',zone:'right',speed:'normal',reflection:'normal',price:'fragile'});v.dc.emit({type:'session.input_transcript.delta',event_id:'i2',delta:'correction',start_ms:3,end_ms:4});await wait(0);assert.equal(v.dc.sent.filter(x=>x.type==='session.commentary.append').length,0);assert.equal(inputs.at(-1).delta,'correction');});
test('provider session.closed immediately enters stop path and releases microphone',async()=>{const e=fixture(),v=voice(e);active.push(v);await v.start();v.dc.emit({type:'session.started',event_id:'s3'});v.dc.emit({type:'session.closed',event_id:'closed_1',reason:'remote_hangup'});await wait(700);assert.equal(e.track.stopped,true);assert.equal(v.state,'stopped');assert.ok(e.calls.some(c=>c.url==='/api/voice/stop'));});
test('cancelled delayed start hangs up returned session and stops tracks',async()=>{const e=fixture();let release;e.request=async(url,body)=>{e.calls.push({url,body});if(url.endsWith('/start'))return new Promise(r=>{release=r;});return{ok:true,json:async()=>({stopped:true})};};const v=voice(e),pending=v.start();await wait(0);await v.stop('cancel');release({ok:true,json:async()=>({sessionId:'live_late_1',sdp:'v=0\r\nanswer',maxDurationMs:45000})});assert.equal(await pending,false);assert.equal(e.track.stopped,true);assert.ok(e.calls.some(c=>c.url==='/api/voice/stop'&&c.body.sessionId==='live_late_1'));});
test('microphone denial and pagehide fail closed',async()=>{const denied=fixture();denied.media.getUserMedia=async()=>{const x=new Error('denied');x.name='NotAllowedError';throw x;};const a=voice(denied);assert.equal(await a.start(),false);assert.equal(a.state,'error');const e=fixture(),v=voice(e);active.push(v);await v.start();e.document.visibilityState='hidden';e.document.listeners.visibilitychange();await wait(700);assert.equal(v.state,'stopped');});
test('remote media track is attached to the output element',async()=>{const e=fixture(),audio={play:()=>Promise.resolve(),pause(){}};const v=voice(e,{audio});active.push(v);await v.start();const remote={id:'remote'};v.pc.emit('track',{streams:[remote]});assert.equal(audio.srcObject,remote);});
test('canonical accepts only validated host rule values',()=>{assert.equal(canonical({version:1,title:'ok',zone:'right',speed:'normal',reflection:'charged',price:'fragile',extra:'ignored'}).extra,undefined);assert.equal(canonical({version:1,title:'bad',zone:'laser',speed:'normal',reflection:'normal',price:'haste'}),null);assert.equal(canonical({version:1,title:'bad',zone:'none',speed:'normal',reflection:'normal',price:'haste'}),null);});

test('voice quota errors explain the per-fight limit without exposing arbitrary server content',async()=>{
 for(const [code,expected] of [['VOICE_QUOTA_voice_duration','Both voice negotiations for this fight are used.'],['VOICE_QUOTA_budget','The voice budget is currently exhausted.'],['PRIVATE_UNTRUSTED_SERVER_CONTENT','Voice is temporarily rate limited.']]){
  const e=fixture({request:async()=>({ok:false,status:429,json:async()=>({error:code})})}),v=voice(e),states=[];v.onState=s=>states.push(s);active.push(v);
  assert.equal(await v.start(),false);assert.ok(states.at(-1).detail.startsWith(expected));assert.equal(states.at(-1).detail.includes('PRIVATE_UNTRUSTED'),false);assert.equal(e.track.stopped,true);
 }
});

test('a correction can update an existing client delegation without a new provider event',async()=>{
 const e=fixture();let count=0;
 const v=voice(e,{onDelegation:async()=>{count++;return{spec:{version:1,title:'Revised pact',zone:count===1?'left':'right',speed:'slow',reflection:'normal',price:'reinforcements'},provider:'openai'};}});active.push(v);
 await v.start();v.dc.emit({type:'session.started',event_id:'revision-start'});
 v.dc.emit({type:'session.delegation.created',event_id:'revision-delegation',delegation:{id:'existing_client_delegation'}});await wait(10);
 v.supersede(true);await wait(10);
 const replies=v.dc.sent.filter(x=>x.type==='session.commentary.append');assert.equal(replies.length,2);assert.equal(replies[0].delegation_id,replies[1].delegation_id);assert.equal(JSON.parse(replies[1].content).covenant.zone,'right');
 await v.stop();v.supersede(true);await wait(10);assert.equal(count,2);
});


test('provider lifecycle evidence counts actual start and close once, including close during application stop',async()=>{
 const e=fixture(),states=[],closed=[];const v=voice(e,{onState:s=>states.push(s),onSessionClosed:e=>closed.push(e)});active.push(v);
 await v.start();const dc=v.dc;assert.equal(states.filter(s=>s.detail==='session-started').length,0);
 dc.emit({type:'session.started',event_id:'start-a'});dc.emit({type:'session.started',event_id:'start-b'});
 assert.equal(states.filter(s=>s.detail==='session-started').length,1);
 const stopping=v.stop('sign');dc.emit({type:'session.closed',event_id:'close-a',reason:'client_close'});dc.emit({type:'session.closed',event_id:'close-b'});
 await stopping;assert.equal(closed.length,1);assert.equal(closed[0].reason,'client_close');
});

test('voice startup deadline covers a stalled body and hangs up its late session without reviving the microphone', {timeout:22000}, async()=>{
 const e=fixture();let releaseBody,enteredBody,aborted=false;
 const bodyEntered=new Promise(resolve=>enteredBody=resolve);
 e.request=async(url,body,options)=>{
  e.calls.push({url,body});
  if(url.endsWith('/start')){
   options.signal.addEventListener('abort',()=>{aborted=true;});
   return {ok:true,status:200,json:()=>{enteredBody();return new Promise(resolve=>releaseBody=resolve);}};
  }
  return {ok:true,json:async()=>({stopped:true})};
 };
 const v=voice(e);active.push(v);const started=Date.now(),pending=v.start({runId:'stalled-body',revision:0});
 await bodyEntered;assert.equal(await pending,false);const elapsed=Date.now()-started;
 assert.ok(elapsed>=14500&&elapsed<21000);assert.equal(aborted,true);assert.equal(v.state,'error');
 assert.equal(e.track.stopped,true);assert.equal(v.pc,null);assert.equal(v.stream,null);assert.equal(v.sessionId,null);
 assert.deepEqual(e.document.listeners,{});
 releaseBody({sessionId:'late_body_session',sdp:'v=0\r\nanswer',maxDurationMs:45000});
 await new Promise(resolve=>setImmediate(resolve));
 assert.ok(e.calls.some(c=>c.url==='/api/voice/stop'&&c.body.sessionId==='late_body_session'));
 assert.equal(v.state,'error');assert.equal(v.sessionId,null);assert.equal(e.track.stopped,true);
});
