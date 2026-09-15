(function(root,factory){
 if(typeof module==='object'&&module.exports)module.exports=factory(require('./adaptive.js'));
 else root.PactAdaptiveClient=factory(root.PactAdaptive);
})(globalThis,function(A){'use strict';
 let ids=0; const uid=()=>globalThis.crypto?.randomUUID?.()||`local-${Date.now().toString(36)}-${++ids}`;
 class AdaptiveClient {
  constructor(session){this.session=session;this.runId=null;this.epoch=0;this.active=null;this.result=null;}
  open(runId=uid()){this.cancel();this.runId=runId;this.result=null;}
  cancel(){this.epoch++;this.active?.abort();this.active=null;this.result=null;}
  close(){this.cancel();this.runId=null;}
  fallback(req){const decision=A.mock(req);return {provider:'local-rules',model:null,decision,applied:A.apply(req,decision),runId:req.runId,sequence:req.sequence,latencyMs:0,reason:'LOCAL RULES: service unavailable or rejected.'};}
  async request(input,live=true){
   if(!this.runId)throw Error('Open adaptive analysis first');
   const req=A.cleanRequest({...input,runId:this.runId});this.cancel();const token=this.epoch;
   if(!live){this.result=this.fallback(req);return this.result;}
   const controller=new AbortController();this.active=controller;const timer=setTimeout(()=>controller.abort(),18000);
   try { await this.session.ensure?.(); if(token!==this.epoch)throw Error('Superseded');if(controller.signal.aborted)throw Error('Analysis timeout');
    const response=await this.session.request('/api/adaptive',{request:req},{signal:controller.signal});if(!response.ok)throw Error('Adaptive service unavailable');
    const x=await response.json();if(token!==this.epoch)throw Error('Superseded');if(x.runId!==req.runId||x.sequence!==req.sequence||!['openai','local-rules'].includes(x.provider))throw Error('Invalid adaptive result');
    if(x.provider==='openai'&&x.model!=='gpt-5.6-luna')throw Error('Invalid adaptive provider');x.decision=A.validateDecision(x.decision);x.applied=A.apply(req,x.decision);this.result=x;return x;
   }catch(error){if(token!==this.epoch)throw error;this.result=this.fallback(req);return this.result;}finally{clearTimeout(timer);if(token===this.epoch)this.active=null;}
  }
  apply(){if(!this.result)throw Error('Adaptive result unavailable');const x=this.result;this.result=null;return x;}
 }
 return AdaptiveClient;
});
