/* Explicit local demo recorder. Capture starts only after ?demo=1 and a click. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.NemesisDemo=factory();})(globalThis,function(){'use strict';
 class DemoRecorder{
  constructor(o={}){this.document=o.document||globalThis.document;this.navigator=o.navigator||globalThis.navigator;this.MediaRecorder=o.MediaRecorder||globalThis.MediaRecorder;this.AudioContext=o.AudioContext||globalThis.AudioContext||globalThis.webkitAudioContext;this.MediaStream=o.MediaStream||globalThis.MediaStream;this.setTimeout=o.setTimeout||globalThis.setTimeout.bind(globalThis);this.clearTimeout=o.clearTimeout||globalThis.clearTimeout.bind(globalThis);this.setInterval=o.setInterval||globalThis.setInterval.bind(globalThis);this.clearInterval=o.clearInterval||globalThis.clearInterval.bind(globalThis);this.URL=o.URL||globalThis.URL;this.onState=o.onState||(()=>{});this.onDownload=o.onDownload||(()=>{});this.state='idle';this.button=null;this.help=null;this.display=null;this.recordStream=null;this.recorder=null;this.audioContext=null;this.destination=null;this.countdown=null;this.generation=0;this.startedAt=0;this.elapsedMs=0;this.remainingMs=0;this.voice={input:null,output:null};this.gameAudioProvider=null;this.gameVideoProvider=null;this.shareTimeoutMs=o.shareTimeoutMs??20000;this._boundPagehide=()=>{this.generation++;this.stop('pagehide');};this._boundEnded=()=>this.stop('share-ended');}
  static enabled(search){return new URLSearchParams(search||globalThis.location?.search||'').get('demo')==='1';}
  attachVoice(stream,kind='input',options={}){if(!stream?.getAudioTracks?.().length||!['input','output'].includes(kind))return false;this.voice[kind]=stream;if(kind==='output'&&options?.element){this.voiceOutputElement?.removeEventListener?.('volumechange',this._voiceVolumeChanged);this.voiceOutputElement=options.element;this._voiceVolumeChanged=()=>this.setVoiceOutputLevel(this.voiceOutputElement.muted?0:this.voiceOutputElement.volume);this.voiceOutputElement.addEventListener?.('volumechange',this._voiceVolumeChanged);this.voiceOutputBound=true;}if(this.audioContext&&(this.state==='starting'||this.state==='recording'))this._connectVoice(kind);return true;}
  setVoiceOutputLevel(value){const level=Math.max(0,Math.min(1,Number(value)||0));this.voiceOutputLevel=level;if(this.voiceOutputGain)this.voiceOutputGain.gain.value=this.voiceOutputElement?.muted?0:level;}
  registerGameAudio(provider){if(typeof provider!=='function')return false;this.gameAudioProvider=provider;if(this.state==='recording')this._connectGameAudio();return true;}
  registerGameVideo(provider){if(typeof provider!=='function')return false;this.gameVideoProvider=provider;return true;}
  drawGameFrame(){const session=this._session;if(!session?.videoCapture||session.cleaned)return;try{session.videoCapture.draw();}catch(error){session.error=true;console.warn('Game recording interrupted:',error?.name||'Error');this.stop('capture-failed');}}
  t(text){return this.document?.defaultView?.PactI18n?.translate(text)||text;}
  attach(){
   if(!this.document||!DemoRecorder.enabled())return false;if(this.button)return true;
   const controls=this.document.createElement('div');controls.id='demo-controls';
   this.mode=this.document.createElement('select');this.mode.id='demo-mode';this.mode.setAttribute('aria-label','Recording source');
   for(const [value,text]of [['game','Game recording · no screen sharing'],['display','Tab recording · choose a shared tab']]){const option=this.document.createElement('option');option.value=value;option.textContent=text;this.mode.append(option);}
   this.button=this.document.createElement('button');this.button.id='demo-record';this.button.type='button';this.button.className='demo-record';this.button.textContent='Record demo';
   this.help=this.document.createElement('small');this.help.id='demo-record-help';this.help.setAttribute('role','status');this.help.setAttribute('aria-live','polite');
   this._idleHelp();this.mode.addEventListener('change',()=>this._idleHelp());
   this.button.addEventListener('click',()=>['starting','recording'].includes(this.state)?this.stop('user'):this.start());controls.append(this.mode,this.button,this.help);this.document.body.append(controls);this.document.body.classList.add('demo-recording-ui');this.document.defaultView?.addEventListener?.('pagehide',this._boundPagehide);return true;
  }
  _idleHelp(){if(this.help)this.help.textContent=this.t(this.mode?.value==='display'?'Choose the game tab. Game audio and active voice are mixed locally.':'Records game graphics, visible text and active audio. UI decoration is simplified. Nothing is uploaded.');}
  _formatElapsed(ms){const total=Math.floor(Math.max(0,ms)/1000),s=String(total%60).padStart(2,'0'),m=Math.floor(total/60);return `${m}:${s}`;}
  _state(s,d=''){
   this.state=s;this.onState({state:s,detail:d,elapsedMs:this.elapsedMs,remainingMs:this.remainingMs});
   if(this.button){this.button.disabled=s==='stopping';this.button.textContent=s==='recording'?this.t('Stop & save')+` (${this._formatElapsed(this.elapsedMs)})`:s==='starting'?this.t('Cancel recording start'):s==='stopping'?this.t('Saving…'):this.t('Record demo');}
   if(this.mode)this.mode.disabled=['starting','recording','stopping'].includes(s);
   if(this.help){if(s==='starting')this.help.textContent=this.t(this._session?.mode==='game'?'Starting game recording…':'Choose this game tab in the share dialog, or cancel here.');else if(s==='recording')this.help.textContent=this.t(this._session?.mode==='game'?'Recording game graphics, text and active audio. UI decoration is simplified.':'Recording the shared tab and active game audio.');else if(s==='error')this.help.textContent=this.t(d==='share-timeout'?'Screen sharing did not start. Select Game recording and try again.':d==='share-cancelled'?'Screen sharing was cancelled. Select Game recording to record without sharing.':'Recording unavailable. Try another recording source or your device screen recorder.');else if(s==='idle')this._idleHelp();}
  }
  _buildAudio(gen){if(!this.AudioContext||!this.MediaStream)return null;this.audioContext=new this.AudioContext();this.destination=this.audioContext.createMediaStreamDestination();this.voiceSources={};this._connectVoice('input');this._connectVoice('output');this._connectGameAudio();if(gen!==this.generation)throw Error('stale-capture');return this.destination.stream.getAudioTracks()[0]||null;}
  _connectGameAudio(){if(!this.audioContext||!this.destination||this.gameAudioRelease)return;let tap;try{tap=this.gameAudioProvider?.();}catch{return;}if(!tap?.stream?.getAudioTracks?.().length){try{tap?.release?.();}catch{}return;}try{const source=this.audioContext.createMediaStreamSource(tap.stream);source.connect(this.destination);this.gameAudioSource=source;this.gameAudioRelease=()=>{try{source.disconnect();}catch{}try{tap.release?.();}catch{}};}catch{try{tap.release?.();}catch{}}}
  _connectVoice(kind){if(!this.audioContext||!this.destination)return;const stream=this.voice[kind];if(!stream?.getAudioTracks().some(t=>t.readyState!=='ended'))return;if(kind==='output'&&this.voiceOutputElement&&!this.voiceOutputBound){this._voiceVolumeChanged??=()=>this.setVoiceOutputLevel(this.voiceOutputElement.muted?0:this.voiceOutputElement.volume);this.voiceOutputElement.addEventListener?.('volumechange',this._voiceVolumeChanged);this.voiceOutputBound=true;}this.voiceSources??={};this.voiceSources[kind]?.disconnect?.();if(kind==='output')this.voiceOutputGain?.disconnect?.();const source=this.audioContext.createMediaStreamSource(stream);if(kind==='output'&&this.audioContext.createGain){const gain=this.voiceOutputGain=this.audioContext.createGain();const level=this.voiceOutputElement?(this.voiceOutputElement.muted?0:Number(this.voiceOutputElement.volume)):this.voiceOutputLevel??1;gain.gain.value=Math.max(0,Math.min(1,Number.isFinite(level)?level:1));source.connect(gain);gain.connect(this.destination);}else source.connect(this.destination);this.voiceSources[kind]=source;}
  async start(){
   if(['starting','recording','stopping'].includes(this.state))return false;
   const mode=this.mode?.value||(this.gameVideoProvider?'game':'display');
   if(!this.MediaRecorder||(mode==='game'?!this.gameVideoProvider:!this.navigator?.mediaDevices?.getDisplayMedia)){this._state('error','capture-unavailable');return false;}
    const gen=++this.generation,session={mode,videoCapture:null,shareTimer:null,display:null,recordStream:null,recorder:null,audioContext:null,destination:null,countdown:null,cleaned:false,chunks:[]};
    this._session=session;this.elapsedMs=0;this.startedAt=0;this._state('starting','local-only');
    try{
     // Create and resume the recorder mixer while the button gesture is active.
     // The share permission prompt may otherwise consume that activation.
     let resumeError;try{this._buildAudio(gen);}finally{session.audioContext=this.audioContext;session.destination=this.destination;}const resume=this.audioContext?.resume?.()?.catch?.(e=>{resumeError=e;});
     let display;
     if(mode==='game'){session.videoCapture=this.gameVideoProvider();display=session.videoCapture.stream;if(!display?.getVideoTracks?.().length)throw Error('No game video');}
     else{session.shareTimer=this.setTimeout(()=>{if(this._session!==session||session.cleaned)return;this.stop('share-timeout');this._state('error','share-timeout');},this.shareTimeoutMs);display=await this.navigator.mediaDevices.getDisplayMedia({video:{frameRate:60,width:{max:1920},height:{max:1080}},audio:false,preferCurrentTab:true,selfBrowserSurface:'include'});this.clearTimeout(session.shareTimer);session.shareTimer=null;}
     if(session.cleaned||this._session!==session){display.getTracks().forEach(t=>{if(t.readyState!=='ended')t.stop();});return false;}
     session.display=this.display=display;session.onEnded=()=>{if(this._session===session)this.stop('share-ended');};display.getVideoTracks().forEach(t=>t.addEventListener?.('ended',session.onEnded,{once:true}));if(resume)await resume;if(resumeError)throw resumeError;
     if(session.cleaned||this._session!==session){display.getTracks().forEach(t=>{if(t.readyState!=='ended')t.stop();});return false;}
     const audioTrack=this.destination?.stream?.getAudioTracks?.()[0]||null;
    session.recordStream=this.recordStream=new this.MediaStream([...display.getVideoTracks(),...(audioTrack?[audioTrack]:[])]);
     if(session.cleaned||this._session!==session)return false;
    const mime=['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm','video/mp4;codecs=avc1.42E01E,mp4a.40.2','video/mp4'].find(x=>this.MediaRecorder.isTypeSupported?.(x))||'';
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
    session.filename=session.recorder.mimeType?.startsWith('video/mp4')?'nemesis-pact-demo.mp4':'nemesis-pact-demo.webm';
    const blob=new Blob(session.chunks,{type:session.recorder.mimeType||'video/webm'}),url=this.URL?.createObjectURL?.(blob);
    if(!url)throw Error('download-unavailable');
    try{
     const a=this.document?.createElement?.('a');if(a){a.href=url;a.download=session.filename;a.className='demo-download';a.textContent=this.t('Download recording');this.downloadLink=a;a.click();}
     this.onDownload({blob,url,filename:session.filename,source:session.mode});saved=true;
    }finally{if(this.help?.append){if(this.downloadURL)this.URL?.revokeObjectURL?.(this.downloadURL);this.downloadURL=url;}else this.setTimeout(()=>this.URL?.revokeObjectURL?.(url),1000);}
   }finally{this._cleanup(session,saved?'saved':'save-failed');}
  }
  _cleanup(session,reason='cancelled'){
   if(!session||session.cleaned)return;session.cleaned=true;this.clearTimeout(session.shareTimer);session.shareTimer=null;this.clearInterval(session.countdown);session.countdown=null;
   session.display?.getVideoTracks?.().forEach(t=>t.removeEventListener?.('ended',session.onEnded));
   const tracks=new Set([...(session.display?.getTracks?.()||[]),...(session.recordStream?.getTracks?.()||[]),...(session.destination?.stream?.getTracks?.()||[])]);
    tracks.forEach(t=>t.stop?.());try{session.videoCapture?.release?.();}catch{}try{this.gameAudioRelease?.();}catch{}this.gameAudioRelease=null;this.gameAudioSource=null;try{this.voiceOutputGain?.disconnect?.();}catch{}this.voiceOutputGain=null;this.voiceOutputElement?.removeEventListener?.('volumechange',this._voiceVolumeChanged);this.voiceOutputBound=false;try{session.audioContext?.close?.()?.catch?.(()=>{});}catch{}
   session.chunks.length=0;
   if(this._session!==session)return;
    this.countdown=null;this.display=null;this.recordStream=null;this.audioContext=null;this.destination=null;this.sources=null;this.voiceSources=null;this.recorder=null;this._session=null;
   this._state(reason==='saved'?'stopped':reason==='save-failed'?'error':'idle',reason);
   if(this.help&&reason==='saved')this.help.textContent=this.t(session.error?'Recording interrupted. A partial video was saved.':'Recording saved. Capture has ended. Nothing was uploaded.')+' '+session.filename;if(this.help&&reason==='saved'&&this.downloadLink)this.help.append?.(' ',this.downloadLink);
  }

 }
  const singleton=new DemoRecorder();singleton.DemoRecorder=DemoRecorder;for(const k of ['attachVoice','registerGameAudio','registerGameVideo','drawGameFrame','attach','start','stop'])singleton[k]=singleton[k].bind(singleton);return singleton;
});
