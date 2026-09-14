/* Official GPT-Live WebRTC transport. No simulation authority. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.PactVoice=factory();})(globalThis,function(){'use strict';
 const STATES=['idle','starting','listening','speaking','stopping','stopped','error'];
 function isProposalWithdrawal(input){
  if(typeof input!=='string')return false;
  const text=input.normalize('NFKC').replace(/\s+/gu,' ').trim();if(!text)return false;
  // A question or a Japanese hypothetical is not an instruction to withdraw.
  if(/[?\uFF1F]\s*$/u.test(text))return false;
  const english=text.match(/\b(?:withdraw|cancel)\b(?:\s+(?:that|it|this|the\s+(?:proposal|offer|counteroffer|deal|terms)|(?:my|the|current|last|previous)(?:\s+(?:current|last|previous))?\s+(?:proposal|offer|counteroffer|deal|terms)))?\s*(?:,?\s*(?:please|now|thanks))?\s*[.!]*$/i);
  if(english){
   const before=text.slice(0,english.index).trim().replace(/[\s,;:]+$/u,'');
   // Keep clause edits and cancellation discussed in the abstract in the
   // proposal path. "can you" remains a direct request; modal/negative
   // framing does not.
   if(/(?:^|\s)(?:don't|do not|never|not|cannot|can't|won't|will not|wouldn't|shouldn't|plan(?:ned|ning)?\s+to|going\s+to|want\s+to|need\s+to|have\s+to|could\s+you|would\s+you)\s*$/i.test(before))return false;
   if(/\b(?:if|whether|suppose|hypothetical(?:ly)?|discuss(?:ed|ing)?|talk(?:ed|ing)?\s+about|consider(?:ed|ing)?)\b/i.test(before))return false;
   return true;
  }
  const clauses=text.split(/[.!;:,\u3001\u3002\uFF01\uFF1F\uFF1B\n]+/u).map(s=>s.trim()).filter(Boolean),last=clauses.at(-1)||'';
  if(/(?:\u3082\u3057|\u4eee\u306b|\u4e07\u4e00|\u304b\u3069\u3046\u304b|\u306b\u3064\u3044\u3066|\u8b70\u8ad6|\u691c\u8a0e|\u8003\u3048(?:\u308b|\u3066)|\u3064\u3082\u308a|\u4e88\u5b9a|\u305f\u3044|\u307b\u3057\u3044)/u.test(last))return false;
  const target='(?:(?:(?:\\u524d|\\u76f4\\u524d|\\u4ee5\\u524d)(?:\\u306e)?|\\u73fe\\u5728\\u306e|\\u3053\\u306e|\\u305d\\u306e)?(?:\\u63d0\\u6848|\\u30aa\\u30d5\\u30a1\\u30fc|\\u5951\\u7d04|\\u6761\\u4ef6|\\u53d6\\u5f15))';
  const action='(?:\\u64a4\\u56de(?:\\u3057\\u3066|\\u3059\\u308b|\\u3057\\u307e\\u3059|\\u3057\\u3066\\u304f\\u3060\\u3055\\u3044)?|\\u53d6\\u308a\\u6d88(?:\\u3057\\u3066|\\u3059|\\u3057\\u307e\\u3059|\\u3057\\u3066\\u304f\\u3060\\u3055\\u3044)?|\\u30ad\\u30e3\\u30f3\\u30bb\\u30eb(?:\\u3057\\u3066|\\u3059\\u308b|\\u3057\\u307e\\u3059|\\u3057\\u3066\\u304f\\u3060\\u3055\\u3044)?)';
  if(new RegExp('^(?:'+target+'(?:\\u3092|\\u306f)?\\s*)?'+action+'(?:\\u304f\\u3060\\u3055\\u3044|\\u4e0b\\u3055\\u3044|\\u304a\\u9858\\u3044\\u3057\\u307e\\u3059|\\u306d|\\u3088)?$','u').test(last))return true;
  return false;
 }
 function serviceMessage(code,status){
  const messages={VOICE_QUOTA_voice_duration:'Both voice negotiations for this fight are used. Continue with text, or start a new First Contact.',VOICE_QUOTA_session_limit:'This browser session has used its request allowance. Continue with LOCAL RULES until the session expires.',VOICE_QUOTA_budget:'The voice budget is currently exhausted. LOCAL RULES remains playable.',VOICE_QUOTA_concurrent:'All voice slots are busy. Try again shortly, or use text.',VOICE_QUOTA_session_busy:'Another voice connection is still active. Stop it before trying again.',VOICE_QUOTA_ip_limit:'Too many requests. Wait one minute, or use LOCAL RULES.',VOICE_QUOTA_kill:'Voice is temporarily paused. Use text or LOCAL RULES.',SESSION_EXPIRED:'Your session expired. Reconnect OpenAI, or use LOCAL RULES.',VOICE_NOT_ENABLED:'Voice is unavailable. Text and LOCAL RULES remain available.'};
  return messages[code]||(status===429?'Voice is temporarily rate limited. Try again later, or use LOCAL RULES.':status===401||status===403?'OpenAI authorization is no longer valid. Reconnect, or use LOCAL RULES.':'The voice service could not connect. Retry, use text, or choose LOCAL RULES.');
 }
 function canonical(v){
  if(!v||v.version!==1||typeof v.title!=='string'||v.title.length>48||!['none','left','center','right'].includes(v.zone)||!['normal','slow'].includes(v.speed)||!['normal','charged'].includes(v.reflection)||!['weaker_gun','reinforcements','fragile','haste'].includes(v.price))return null;
  const benefit=(v.zone!=='none'?2:0)+(v.speed==='slow'?1:0)+(v.reflection==='charged'?1:0),payment={weaker_gun:2,reinforcements:3,fragile:3,haste:2}[v.price];
  if(benefit<1||benefit>3||benefit>payment)return null;
  return Object.fromEntries(['version','title','zone','speed','reflection','price'].map(k=>[k,v[k]]));
 }
 class PactVoice{
  constructor(o={}){
   this.request=o.request;this.media=o.mediaDevices||globalThis.navigator?.mediaDevices;this.PC=o.RTCPeerConnection||globalThis.RTCPeerConnection;this.document=o.document||globalThis.document;this.audio=o.audio||null;
   this.onState=o.onState||(()=>{});this.onCaption=o.onCaption||(()=>{});this.onInput=o.onInput||(()=>{});this.onDelegation=o.onDelegation;this.onSessionClosed=o.onSessionClosed||(()=>{});this.onMedia=o.onMedia||(()=>{});
   this.state='idle';this.transportGeneration=0;this.delegationGeneration=0;this.events=new Set();this.delegations=new Set();this.closed=true;this.finalized=false;this.stopPromise=null;this.delegationWork=null;this.fallbackDelegationDelayMs=o.fallbackDelegationDelayMs??2750;
   this._hidden=()=>{if(this.document?.visibilityState==='hidden')this.stop('background');};this._pagehide=()=>this.stop('pagehide');
  }
  _state(state,detail=''){this.state=state;this.onState({state,detail,sessionId:this.sessionId});}
  _send(e){if(this.dc?.readyState!=='open')return false;try{this.dc.send(JSON.stringify(e));return true;}catch{return false;}}
  _http(path,body,signal){return this.request(path,body,{signal,keepalive:path.endsWith('/stop')});}
  _event(raw,g=this.transportGeneration){
   if(g!==this.transportGeneration)return;let e;try{e=typeof raw==='string'?JSON.parse(raw):raw;}catch{return;}if(!e||typeof e.type!=='string')return;
   if(e.event_id){if(this.events.has(e.event_id))return;this.events.add(e.event_id);if(this.events.size>1000)this.events.delete(this.events.values().next().value);}
   if(e.type==='session.closed'){if(this.finalized)return;this.finalized=true;this.finalUsage=Number.isFinite(e.usage?.seconds)?e.usage.seconds:null;this.onSessionClosed({reason:e.reason||'closed',usage:this.finalUsage,eventId:e.event_id});this.stop('provider-'+(e.reason||'closed'));return;}
   if(this.closed)return;
   if(e.type==='session.started'){if(this.started)return;if(e.session?.id&&e.session.id!==this.sessionId){this.stop('session-mismatch');return;}this.started=true;this._state('listening','session-started');return;}
   if(e.type==='session.input_transcript.delta'&&typeof e.delta==='string'){
    this._state('listening');this.onCaption({speaker:'user',delta:e.delta,start_ms:e.start_ms,end_ms:e.end_ms,eventId:e.event_id});this.onInput({delta:e.delta,start_ms:e.start_ms,end_ms:e.end_ms,eventId:e.event_id});return;
   }
   if(e.type==='session.output_transcript.delta'&&typeof e.delta==='string'){this.onCaption({speaker:'assistant',delta:e.delta,start_ms:e.start_ms,end_ms:e.end_ms,eventId:e.event_id});this._state('speaking');return;}
   if(e.type==='session.delegation.created'){const id=e.delegation?.id;if(typeof id!=='string'||this.delegations.has(id)||this.delegations.size>=8)return;this.delegations.add(id);const work=this.delegationWork;this.latestDelegation={id,event:e};if(work?.generation===this.delegationGeneration)return;this._queueDelegation();return;}
   if(e.type==='error'){this._state('error','provider-error');this.stop('provider-error');}
  }
  async _delegate(id,event,generation=this.delegationGeneration,source='provider'){
   if(!this.onDelegation)return;const transport=this.transportGeneration,work=this.delegationWork;
   try{
    const result=await this.onDelegation({delegationId:id,event,generation});
    if(this.closed||transport!==this.transportGeneration||generation!==this.delegationGeneration)return;
    const spec=canonical(result?.spec||result?.proposal||result);
    const content=spec?JSON.stringify({status:'unsigned',provider:result.provider||'local-rules',covenant:spec,instruction:'Only these displayed clauses are available. Ask the player to review and click Sign.'}):'No new covenant is available. Ask for new terms. Do not claim acceptance.';
    this._send({type:'session.commentary.append',event_id:`covenant_${transport}_${generation}`,delegation_id:id??null,content});
    if(work?.generation===generation){work.pending=false;work.committed=true;work.source=source;}
   }catch{if(!this.closed&&transport===this.transportGeneration&&generation===this.delegationGeneration)this._state('listening','proposal-unavailable-use-text');}
  }
  _queueDelegation(){
   clearTimeout(this.delegationTimer);
   const generation=this.delegationGeneration,latest=this.latestDelegation;
   if(this.closed||(this.delegationAttempts||0)>=8)return;
   const current=this.delegationWork;
   if(current?.generation===generation&&(current.pending||current.committed))return;
   const source=latest?'provider':'fallback',delay=latest?(this.delegationDelayMs??1500):this.fallbackDelegationDelayMs;
   this.delegationTimer=setTimeout(()=>{this.delegationTimer=null;if(this.closed||generation!==this.delegationGeneration)return;this.delegationAttempts=(this.delegationAttempts||0)+1;const work={generation,source,pending:true,committed:false};this.delegationWork=work;this._delegate(latest?.id??null,latest?.event??null,generation,source);},delay);
  }
  _install(){this.document?.addEventListener?.('visibilitychange',this._hidden);globalThis.addEventListener?.('pagehide',this._pagehide);}
  _cleanup(){
   clearTimeout(this.timer);clearTimeout(this.delegationTimer);this.timer=null;this.latestDelegation=null;this.delegationWork=null;this.closed=true;this.transportGeneration++;this.delegationGeneration++;
   this.stream?.getTracks().forEach(t=>t.stop());try{this.dc?.close();}catch{}try{this.pc?.close();}catch{}
   if(this.audio){this.audio.pause?.();this.audio.srcObject=null;}this.stream=null;this.pc=null;this.dc=null;this.sessionId=null;
   this.document?.removeEventListener?.('visibilitychange',this._hidden);globalThis.removeEventListener?.('pagehide',this._pagehide);
  }
  async _hangup(id){
   if(!id)return true;const ac=new AbortController(),timer=setTimeout(()=>ac.abort(),12000);
   try{const r=await this._http('/api/voice/stop',{sessionId:id},ac.signal);return !!r?.ok&&(await r.json()).stopped===true;}catch{return false;}finally{clearTimeout(timer);}
  }
  async start({runId,revision}={}){
   if(this.stopPromise||['starting','listening','speaking','stopping'].includes(this.state))return false;
   if(!this.request||!this.media?.getUserMedia||!this.PC){this._state('error','voice-not-supported-use-text');return false;}
   const generation=++this.transportGeneration;this.delegationGeneration++;this.closed=false;this.started=false;this.finalized=false;this.finalUsage=null;this.latestDelegation=null;this.delegationWork=null;this.delegationAttempts=0;this.events.clear();this.delegations.clear();this._install();this._state('starting');let stream,pc,createdId;
   try{
    stream=await this.media.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true},video:false});
    if(generation!==this.transportGeneration||this.closed){stream.getTracks().forEach(t=>t.stop());return false;}
    this.stream=stream;this.onMedia(stream,'input');pc=new this.PC();this.pc=pc;for(const track of stream.getTracks())pc.addTrack(track,stream);
    pc.addEventListener('track',e=>{if(generation!==this.transportGeneration||this.closed||!this.audio)return;const remote=e.streams?.[0]||(e.track&&new MediaStream([e.track]));if(!remote)return;this.onMedia(remote,'output');this.audio.srcObject=remote;this.audio.play?.().catch(()=>this._state(this.state,'audio-output-blocked-use-captions'));});
    pc.addEventListener('connectionstatechange',()=>{if(generation===this.transportGeneration&&!this.closed&&['failed','closed','disconnected'].includes(pc.connectionState))this.stop('connection-lost');});
    const dc=pc.createDataChannel('oai-events');this.dc=dc;dc.addEventListener('message',e=>this._event(e.data,generation));dc.addEventListener('close',()=>{if(generation===this.transportGeneration&&!this.closed)this.stop('connection-lost');});
    await pc.setLocalDescription(await pc.createOffer());
    if(pc.iceGatheringState!=='complete')await new Promise((resolve,reject)=>{
     const finish=(error)=>{clearTimeout(timer);pc.removeEventListener('icegatheringstatechange',check);error?reject(error):resolve();};
     const check=()=>{if(generation!==this.transportGeneration||this.closed)finish(Error('cancelled'));else if(pc.iceGatheringState==='complete')finish();};
     const timer=setTimeout(()=>finish(Error('ice-timeout')),10000);pc.addEventListener('icegatheringstatechange',check);check();
    });
    if(generation!==this.transportGeneration||this.closed)throw Error('cancelled');
    const ac=new AbortController();let timer,data;
    // Keep the deadline through the response body, including transports that ignore abort.
    const response=(async()=>{
     const r=await this._http('/api/voice/start',{runId,revision,sdp:pc.localDescription.sdp},ac.signal);
     if(!r?.ok){let body;try{body=await r?.json();}catch{}throw Object.assign(Error('voice-service-'+(r?.status||'unavailable')),{voiceDetail:serviceMessage(body?.error,r?.status)});}
     const value=await r.json();
     if(generation!==this.transportGeneration||this.closed){if(typeof value?.sessionId==='string')await this._hangup(value.sessionId);return null;}
     return value;
    })();
    try{data=await Promise.race([response,new Promise((_,reject)=>{timer=setTimeout(()=>{ac.abort();reject(Error('voice-start-timeout'));},15000);})]);}finally{clearTimeout(timer);}
    if(!data)return false;createdId=data.sessionId;
    if(typeof createdId!=='string'||typeof data.sdp!=='string')throw Error('invalid-session');
    if(generation!==this.transportGeneration||this.closed){await this._hangup(createdId);return false;}
    this.sessionId=createdId;await pc.setRemoteDescription({type:'answer',sdp:data.sdp});
    if(generation!==this.transportGeneration||this.closed){await this._hangup(createdId);return false;}
    this.timer=setTimeout(()=>this.stop('duration-limit'),Math.min(45000,Math.max(1000,Number(data.maxDurationMs)||45000)));
    // session.started, not SDP completion, is the listening-state authority.
    return true;
   }catch(error){
    stream?.getTracks().forEach(t=>t.stop());if(createdId)await this._hangup(createdId);
    if(generation===this.transportGeneration){this._cleanup();this._state('error',error.voiceDetail||(error.name==='NotAllowedError'?'microphone-denied-use-text':error.name==='NotFoundError'?'microphone-unavailable-use-text':'voice-unavailable-use-text'));}else{try{pc?.close();}catch{}}
    return false;
   }
  }
  stop(reason='user'){
   if(this.stopPromise)return this.stopPromise;if(this.closed&&!this.pc&&!this.stream&&!this.sessionId&&this.state!=='starting')return Promise.resolve();
   const id=this.sessionId;this.closed=true;this.delegationGeneration++;clearTimeout(this.timer);clearTimeout(this.delegationTimer);this.stream?.getTracks().forEach(t=>t.stop());this._state('stopping',reason);
   this.stopPromise=(async()=>{
    // REST hangup is the server-authoritative close. Do not race it with a
    // client close before the server can confirm termination and settle quota.
    const confirmed=await this._hangup(id);
    if(!confirmed)this._send({type:'session.close'});
    if(this.dc?.readyState==='open'&&!this.finalized)await new Promise(resolve=>setTimeout(resolve,600));
    this._cleanup();this._state('stopped',confirmed?reason:'upstream-stop-unconfirmed');this.stopPromise=null;
   })();return this.stopPromise;
  }
  supersede(reviseDelegation=false){this.delegationGeneration++;clearTimeout(this.delegationTimer);if(reviseDelegation)this._queueDelegation();}
  mute(){this.stream?.getAudioTracks().forEach(t=>{t.enabled=false;});}
  unmute(){this.stream?.getAudioTracks().forEach(t=>{t.enabled=true;});}
  setVolume(value){if(this.audio)this.audio.volume=Math.max(0,Math.min(1,Number(value)||0));}
 }
 return {PactVoice,canonical,STATES,isProposalWithdrawal};
});
