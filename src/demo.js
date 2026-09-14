/* Explicit local demo recorder. Capture starts only after ?demo=1 and a click. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.NemesisDemo=factory();})(globalThis,function(){'use strict';
 class DemoRecorder{
  constructor(o={}){this.document=o.document||globalThis.document;this.navigator=o.navigator||globalThis.navigator;this.MediaRecorder=o.MediaRecorder||globalThis.MediaRecorder;this.AudioContext=o.AudioContext||globalThis.AudioContext||globalThis.webkitAudioContext;this.MediaStream=o.MediaStream||globalThis.MediaStream;this.setTimeout=o.setTimeout||globalThis.setTimeout.bind(globalThis);this.clearTimeout=o.clearTimeout||globalThis.clearTimeout.bind(globalThis);this.setInterval=o.setInterval||globalThis.setInterval.bind(globalThis);this.clearInterval=o.clearInterval||globalThis.clearInterval.bind(globalThis);this.URL=o.URL||globalThis.URL;this.onState=o.onState||(()=>{});this.onDownload=o.onDownload||(()=>{});this.state='idle';this.button=null;this.help=null;this.display=null;this.recordStream=null;this.recorder=null;this.audioContext=null;this.destination=null;this.countdown=null;this.generation=0;this.startedAt=0;this.elapsedMs=0;this.remainingMs=0;this.voice={input:null,output:null};this._boundPagehide=()=>{this.generation++;this.stop('pagehide');};this._boundEnded=()=>this.stop('share-ended');}
  static enabled(search){return new URLSearchParams(search||globalThis.location?.search||'').get('demo')==='1';}
  attachVoice(stream,kind='input'){if(!stream?.getAudioTracks?.().length||!['input','output'].includes(kind))return false;this.voice[kind]=stream;if(this.state==='recording')this._connectVoice(kind);return true;}
  attach(){if(!this.document||!DemoRecorder.enabled())return false;if(this.button)return true;this.button=this.document.createElement('button');this.button.id='demo-record';this.button.type='button';this.button.className='demo-record';this.button.textContent='Record demo';this.help=this.document.createElement('small');this.help.id='demo-record-help';this.help.textContent='Record until Stop & save. Game tab and active voice stay local; nothing is uploaded.';this.button.addEventListener('click',()=>this.state==='recording'?this.stop('user'):this.start());this.document.body.append(this.button,this.help);this.document.defaultView?.addEventListener?.('pagehide',this._boundPagehide);return true;}
  _formatElapsed(ms){const total=Math.floor(Math.max(0,ms)/1000),s=String(total%60).padStart(2,'0'),m=Math.floor(total/60);return `${m}:${s}`;}
  _state(s,d=''){this.state=s;this.onState({state:s,detail:d,elapsedMs:this.elapsedMs,remainingMs:this.remainingMs});if(this.button){this.button.disabled=s==='starting'||s==='stopping';this.button.textContent=s==='recording'?`Stop & save (${this._formatElapsed(this.elapsedMs)})`:s==='stopping'?'Saving…':'Record demo';}if(this.help&&s==='starting')this.help.textContent='Choose this game tab in the share dialog. Capture stays local; nothing is uploaded.';}
  _buildAudio(gen){if(!this.AudioContext||!this.MediaStream)return null;this.audioContext=new this.AudioContext();this.destination=this.audioContext.createMediaStreamDestination();const connect=stream=>{if(!stream?.getAudioTracks?.().length)return;const src=this.audioContext.createMediaStreamSource(stream);src.connect(this.destination);(this.sources??=[]).push(src);};this.hasTabAudio=this.display.getAudioTracks().length>0;this.voiceSources={};connect(this.display);this._connectVoice('input');this._connectVoice('output');if(gen!==this.generation)throw Error('stale-capture');return this.destination.stream.getAudioTracks()[0]||null;}
  _connectVoice(kind){if(!this.audioContext||!this.destination||kind==='output'&&this.hasTabAudio)return;const stream=this.voice[kind];if(!stream?.getAudioTracks().some(t=>t.readyState!=='ended'))return;this.voiceSources??={};this.voiceSources[kind]?.disconnect?.();const source=this.audioContext.createMediaStreamSource(stream);source.connect(this.destination);this.voiceSources[kind]=source;}
  async start(){
   if(['starting','recording','stopping'].includes(this.state))return false;
   if(!this.navigator?.mediaDevices?.getDisplayMedia||!this.MediaRecorder){this._state('error','capture-unavailable');return false;}
   const gen=++this.generation,session={display:null,recordStream:null,recorder:null,audioContext:null,destination:null,countdown:null,cleaned:false,chunks:[]};
   this._session=session;this.elapsedMs=0;this.startedAt=0;this._state('starting','local-only');
   try{
    const display=await this.navigator.mediaDevices.getDisplayMedia({video:{frameRate:60,width:{max:1920},height:{max:1080}},audio:true,preferCurrentTab:true,selfBrowserSurface:'include'});
    if(session.cleaned||this._session!==session){display.getTracks().forEach(t=>t.stop());return false;}
    session.display=this.display=display;
    session.onEnded=()=>{if(this._session===session)this.stop('share-ended');};
    display.getVideoTracks().forEach(t=>t.addEventListener?.('ended',session.onEnded,{once:true}));
    let audioTrack;
    try{audioTrack=this._buildAudio(gen);}finally{session.audioContext=this.audioContext;session.destination=this.destination;}
    session.recordStream=this.recordStream=new this.MediaStream([...display.getVideoTracks(),...(audioTrack?[audioTrack]:[])]);
    await session.audioContext?.resume?.();
    if(session.cleaned||this._session!==session)return false;
    const mime=['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'].find(x=>this.MediaRecorder.isTypeSupported?.(x))||'';
    const rec=new this.MediaRecorder(session.recordStream,{...(mime?{mimeType:mime}:{}),videoBitsPerSecond:12000000,audioBitsPerSecond:128000});
    session.recorder=this.recorder=rec;
    rec.addEventListener('dataavailable',e=>{if(e.data?.size)session.chunks.push(e.data);});
    rec.addEventListener('stop',()=>this._finish(session));
    rec.addEventListener('error',()=>{session.error=true;if(this._session===session)this.stop('capture-failed');});
    this.startedAt=Date.now();rec.start(250);this._state('recording');
    session.countdown=this.countdown=this.setInterval(()=>{if(this._session!==session||this.state!=='recording')return;this.elapsedMs=Date.now()-this.startedAt;this._state('recording');},1000);
    return true;
   }catch(e){
    const current=this._session===session;this._cleanup(session);
    if(current)this._state('error',e?.name==='NotAllowedError'?'share-cancelled':'capture-failed');
    return false;
   }
  }
  stop(reason='user'){
   if(['idle','stopped','stopping'].includes(this.state))return false;
   this.generation++;this.elapsedMs=this.startedAt?Date.now()-this.startedAt:0;
   const session=this._session;if(!session)return false;
   this._state('stopping',reason);this.clearInterval(session.countdown);session.countdown=null;
   if(session.recorder?.state==='recording'){session.recorder.stop();}else if(session.recorder){/* Inactive after an encoder error: await its queued stop/data events. */}else this._cleanup(session,reason);
   return true;
  }
  _finish(session){
   if(session.cleaned)return;
   let saved=false;
   try{
    const blob=new Blob(session.chunks,{type:session.recorder.mimeType||'video/webm'}),url=this.URL?.createObjectURL?.(blob);
    if(!url)throw Error('download-unavailable');
    try{
     const a=this.document?.createElement?.('a');if(a){a.href=url;a.download='nemesis-pact-demo.webm';a.click();}
     this.onDownload({blob,url});saved=true;
    }finally{this.setTimeout(()=>this.URL?.revokeObjectURL?.(url),1000);}
   }finally{this._cleanup(session,saved?'saved':'save-failed');}
  }
  _cleanup(session,reason='cancelled'){
   if(!session||session.cleaned)return;session.cleaned=true;this.clearInterval(session.countdown);session.countdown=null;
   session.display?.getVideoTracks?.().forEach(t=>t.removeEventListener?.('ended',session.onEnded));
   const tracks=new Set([...(session.display?.getTracks?.()||[]),...(session.recordStream?.getTracks?.()||[]),...(session.destination?.stream?.getTracks?.()||[])]);
   tracks.forEach(t=>t.stop?.());try{session.audioContext?.close?.()?.catch?.(()=>{});}catch{}
   session.chunks.length=0;
   if(this._session!==session)return;
   this.countdown=null;this.display=null;this.recordStream=null;this.audioContext=null;this.destination=null;this.sources=null;this.voiceSources=null;this.recorder=null;this._session=null;
   this._state(reason==='saved'?'stopped':reason==='save-failed'?'error':'idle',reason);
   if(this.help&&reason==='saved')this.help.textContent='Saved nemesis-pact-demo.webm. Recording and screen sharing ended. Edit your submission to 60 seconds in Resolve.';
  }

 }
 const singleton=new DemoRecorder();singleton.DemoRecorder=DemoRecorder;for(const k of ['attachVoice','attach','start','stop'])singleton[k]=singleton[k].bind(singleton);return singleton;
});
