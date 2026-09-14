/* Official GPT-Live WebRTC transport. No simulation authority. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.PactVoice=factory();})(globalThis,function(){'use strict';
 const STATES=['idle','starting','listening','speaking','stopping','stopped','error'];
 function canonical(v){
  if(!v||v.version!==1||typeof v.title!=='string'||v.title.length>48||!['none','left','center','right'].includes(v.zone)||!['normal','slow'].includes(v.speed)||!['normal','charged'].includes(v.reflection)||!['weaker_gun','reinforcements','fragile','haste'].includes(v.price))return null;
  const benefit=(v.zone!=='none'?2:0)+(v.speed==='slow'?1:0)+(v.reflection==='charged'?1:0),payment={weaker_gun:2,reinforcements:3,fragile:3,haste:2}[v.price];
  if(benefit<1||benefit>3||benefit>payment)return null;
  return Object.fromEntries(['version','title','zone','speed','reflection','price'].map(k=>[k,v[k]]));
 }
 class PactVoice{
  constructor(o={}){
   this.request=o.request;this.media=o.mediaDevices||globalThis.navigator?.mediaDevices;this.PC=o.RTCPeerConnection||globalThis.RTCPeerConnection;this.document=o.document||globalThis.document;this.audio=o.audio||null;
   this.onState=o.onState||(()=>{});this.onCaption=o.onCaption||(()=>{});this.onInput=o.onInput||(()=>{});this.onDelegation=o.onDelegation;
   this.state='idle';this.transportGeneration=0;this.delegationGeneration=0;this.events=new Set();this.delegations=new Set();this.closed=true;this.finalized=false;this.stopPromise=null;
   this._hidden=()=>{if(this.document?.visibilityState==='hidden')this.stop('background');};this._pagehide=()=>this.stop('pagehide');
  }
  _state(state,detail=''){this.state=state;this.onState({state,detail,sessionId:this.sessionId});}
  _send(e){if(this.dc?.readyState!=='open')return false;try{this.dc.send(JSON.stringify(e));return true;}catch{return false;}}
  _http(path,body,signal){return this.request(path,body,{signal,keepalive:path.endsWith('/stop')});}
  _event(raw,g=this.transportGeneration){
   if(g!==this.transportGeneration)return;let e;try{e=typeof raw==='string'?JSON.parse(raw):raw;}catch{return;}if(!e||typeof e.type!=='string')return;
   if(e.event_id){if(this.events.has(e.event_id))return;this.events.add(e.event_id);if(this.events.size>1000)this.events.delete(this.events.values().next().value);}
   if(e.type==='session.closed'){this.finalized=true;this.finalUsage=Number.isFinite(e.usage?.seconds)?e.usage.seconds:null;this.stop('provider-'+(e.reason||'closed'));return;}
   if(this.closed)return;
   if(e.type==='session.started'){if(e.session?.id&&e.session.id!==this.sessionId){this.stop('session-mismatch');return;}this._state('listening');return;}
   if(e.type==='session.input_transcript.delta'&&typeof e.delta==='string'){
    this._state('listening');this.onCaption({speaker:'user',delta:e.delta,start_ms:e.start_ms,end_ms:e.end_ms,eventId:e.event_id});this.onInput({delta:e.delta,start_ms:e.start_ms,end_ms:e.end_ms,eventId:e.event_id});return;
   }
   if(e.type==='session.output_transcript.delta'&&typeof e.delta==='string'){this.onCaption({speaker:'assistant',delta:e.delta,start_ms:e.start_ms,end_ms:e.end_ms,eventId:e.event_id});this._state('speaking');return;}
   if(e.type==='session.delegation.created'){const id=e.delegation?.id;if(typeof id!=='string'||this.delegations.has(id)||this.delegations.size>=8)return;this.delegations.add(id);this._delegate(id,e);return;}
   if(e.type==='error'){this._state('error','provider-error');this.stop('provider-error');}
  }
  async _delegate(id,event){
   if(!this.onDelegation)return;const transport=this.transportGeneration,generation=this.delegationGeneration;
   try{
    const result=await this.onDelegation({delegationId:id,event,generation});
    if(this.closed||transport!==this.transportGeneration||generation!==this.delegationGeneration)return;
    const spec=canonical(result?.spec||result?.proposal||result);
    const content=spec?JSON.stringify({status:'unsigned',provider:result.provider||'local-rules',covenant:spec,instruction:'Only these displayed clauses are available. Ask the player to review and click Sign.'}):'No new covenant is available. Ask for new terms. Do not claim acceptance.';
    this._send({type:'session.commentary.append',event_id:'covenant_'+id,delegation_id:id,content});
   }catch{if(!this.closed&&transport===this.transportGeneration)this._state('listening','proposal-unavailable-use-text');}
  }
  _install(){this.document?.addEventListener?.('visibilitychange',this._hidden);globalThis.addEventListener?.('pagehide',this._pagehide);}
  _cleanup(){
   clearTimeout(this.timer);this.timer=null;this.closed=true;this.transportGeneration++;this.delegationGeneration++;
   this.stream?.getTracks().forEach(t=>t.stop());try{this.dc?.close();}catch{}try{this.pc?.close();}catch{}
   if(this.audio){this.audio.pause?.();this.audio.srcObject=null;}this.stream=null;this.pc=null;this.dc=null;this.sessionId=null;
   this.document?.removeEventListener?.('visibilitychange',this._hidden);globalThis.removeEventListener?.('pagehide',this._pagehide);
  }
  async _hangup(id){
   if(!id)return true;const ac=new AbortController(),timer=setTimeout(()=>ac.abort(),4000);
   try{const r=await this._http('/api/voice/stop',{sessionId:id},ac.signal);return !!r?.ok&&(await r.json()).stopped===true;}catch{return false;}finally{clearTimeout(timer);}
  }
  async start({runId,revision}={}){
   if(this.stopPromise||['starting','listening','speaking','stopping'].includes(this.state))return false;
   if(!this.request||!this.media?.getUserMedia||!this.PC){this._state('error','voice-not-supported-use-text');return false;}
   const generation=++this.transportGeneration;this.delegationGeneration++;this.closed=false;this.finalized=false;this.finalUsage=null;this.events.clear();this.delegations.clear();this._install();this._state('starting');let stream,pc,createdId;
   try{
    stream=await this.media.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true},video:false});
    if(generation!==this.transportGeneration||this.closed){stream.getTracks().forEach(t=>t.stop());return false;}
    this.stream=stream;pc=new this.PC();this.pc=pc;for(const track of stream.getTracks())pc.addTrack(track,stream);
    pc.addEventListener('track',e=>{if(generation!==this.transportGeneration||this.closed||!this.audio)return;const remote=e.streams?.[0]||(e.track&&new MediaStream([e.track]));if(!remote)return;this.audio.srcObject=remote;this.audio.play?.().catch(()=>this._state(this.state,'audio-output-blocked-use-captions'));});
    pc.addEventListener('connectionstatechange',()=>{if(generation===this.transportGeneration&&!this.closed&&['failed','closed','disconnected'].includes(pc.connectionState))this.stop('connection-lost');});
    const dc=pc.createDataChannel('oai-events');this.dc=dc;dc.addEventListener('message',e=>this._event(e.data,generation));dc.addEventListener('close',()=>{if(generation===this.transportGeneration&&!this.closed)this.stop('connection-lost');});
    await pc.setLocalDescription(await pc.createOffer());
    if(pc.iceGatheringState!=='complete')await new Promise((resolve,reject)=>{
     const finish=(error)=>{clearTimeout(timer);pc.removeEventListener('icegatheringstatechange',check);error?reject(error):resolve();};
     const check=()=>{if(generation!==this.transportGeneration||this.closed)finish(Error('cancelled'));else if(pc.iceGatheringState==='complete')finish();};
     const timer=setTimeout(()=>finish(Error('ice-timeout')),10000);pc.addEventListener('icegatheringstatechange',check);check();
    });
    if(generation!==this.transportGeneration||this.closed)throw Error('cancelled');
    const ac=new AbortController(),timer=setTimeout(()=>ac.abort(),15000);let r;
    try{r=await this._http('/api/voice/start',{runId,revision,sdp:pc.localDescription.sdp},ac.signal);}finally{clearTimeout(timer);}
    if(!r?.ok)throw Error('voice-service-'+(r?.status||'unavailable'));
    const data=await r.json();createdId=data.sessionId;
    if(typeof createdId!=='string'||typeof data.sdp!=='string')throw Error('invalid-session');
    if(generation!==this.transportGeneration||this.closed){await this._hangup(createdId);return false;}
    this.sessionId=createdId;await pc.setRemoteDescription({type:'answer',sdp:data.sdp});
    if(generation!==this.transportGeneration||this.closed){await this._hangup(createdId);return false;}
    this.timer=setTimeout(()=>this.stop('duration-limit'),Math.min(45000,Math.max(1000,Number(data.maxDurationMs)||45000)));
    // session.started, not SDP completion, is the listening-state authority.
    return true;
   }catch(error){
    stream?.getTracks().forEach(t=>t.stop());if(createdId)await this._hangup(createdId);
    if(generation===this.transportGeneration){this._cleanup();this._state('error',error.name==='NotAllowedError'?'microphone-denied-use-text':error.name==='NotFoundError'?'microphone-unavailable-use-text':'voice-unavailable-use-text');}else{try{pc?.close();}catch{}}
    return false;
   }
  }
  stop(reason='user'){
   if(this.stopPromise)return this.stopPromise;if(this.closed&&!this.pc&&!this.stream&&!this.sessionId&&this.state!=='starting')return Promise.resolve();
   const id=this.sessionId;this.closed=true;this.delegationGeneration++;clearTimeout(this.timer);this.stream?.getTracks().forEach(t=>t.stop());this._send({type:'session.close'});this._state('stopping',reason);
   this.stopPromise=(async()=>{
    if(this.dc?.readyState==='open'&&!this.finalized)await new Promise(resolve=>setTimeout(resolve,600));
    const confirmed=await this._hangup(id);this._cleanup();this._state('stopped',confirmed?reason:'upstream-stop-unconfirmed');this.stopPromise=null;
   })();return this.stopPromise;
  }
  supersede(){this.delegationGeneration++;}
  mute(){this.stream?.getAudioTracks().forEach(t=>{t.enabled=false;});}
  unmute(){this.stream?.getAudioTracks().forEach(t=>{t.enabled=true;});}
  setVolume(value){if(this.audio)this.audio.volume=Math.max(0,Math.min(1,Number(value)||0));}
 }
 return {PactVoice,canonical,STATES};
});
