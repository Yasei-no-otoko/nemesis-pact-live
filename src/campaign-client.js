/* Sector pact proposals share the durable admission gate, never simulation authority. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./campaign.js'),require('./intelligence.js'));else root.PactCampaignClient=factory(root.PactCampaign,root.PactIntelligence);})(globalThis,function(C,I){'use strict';
 let offlineId=0;
 const uid=()=>globalThis.crypto?.randomUUID?.()||`local-${Date.now().toString(36)}-${++offlineId}-${Math.random().toString(36).slice(2,12)}`;
 class CampaignClient {
  constructor(session){this.session=session;this.sequence=0;this.intentVersion=0;this.runId=null;this.proposal=null;this.active=null;this.serverOwned=false;this.pendingSign=false;}
  send(action,body,options){return this.session.request('/api/campaign',{action,...body},options);}
  cancel(){this.sequence++;this.intentVersion++;this.active?.abort();this.active=null;this.proposal=null;if(this.runId&&this.serverOwned&&this.session.csrf)this.send('cancel',{runId:this.runId,intentVersion:this.intentVersion},{keepalive:true}).catch(()=>{});}
  open(context){this.cancel();this.context=C.context(context);this.runId=uid();this.intentVersion=0;this.serverOwned=false;this.pendingSign=false;}
  close(){this.cancel();this.runId=null;this.serverOwned=false;}
  async request(input,live){
   const clean=C.cleanRequest(input,this.context);this.cancel();
   const seq=this.sequence,runId=this.runId,intentVersion=++this.intentVersion,requestId=uid();if(!runId)throw Error('Open negotiation first');
   const current=()=>seq===this.sequence&&runId===this.runId;
   const local=reason=>({decision:I.mock(clean),provider:'local-rules',model:null,reason,latencyMs:0});let result;
   if(!live)result=local('LOCAL RULES / No AI calls.');
   else {
    const controller=new AbortController();this.active=controller;const timer=setTimeout(()=>controller.abort(),18000);
    try {await this.session.ensure();if(!current())throw Error('Superseded');this.serverOwned=true;
     const response=await this.send('propose',{request:clean,context:this.context,runId,requestId,intentVersion},{signal:controller.signal});
     if(!response.ok)throw Error('Service unavailable');result=await response.json();if(!current())throw Error('Superseded');
     if(!['openai','local-rules'].includes(result.provider))throw Error('Invalid provider');result.decision=I.validateDecision(result.decision,clean);
     if(result.provider==='openai'&&(!result.proposalId||!result.digest||result.requestId!==requestId||result.intentVersion!==intentVersion))throw Error('Invalid proposal');
    }catch(error){if(!current())throw error;result=local('OpenAI unavailable, timed out or budget reached. LOCAL RULES remain playable.');}
    finally{clearTimeout(timer);if(current())this.active=null;}
   }
   if(!current())throw Error('Superseded');this.proposal={...result,decision:I.validateDecision(result.decision,clean),clean,seq,runId,intentVersion};return this.proposal;
  }
  async apply(){
   const p=this.proposal;if(!p||p.seq!==this.sequence||this.pendingSign)throw Error('Proposal unavailable');this.pendingSign=true;
   try {
    if(p.provider==='openai'){
     const response=await this.send('sign',{runId:p.runId,intentVersion:p.intentVersion,revision:0,proposalId:p.proposalId,digest:p.digest},{signal:AbortSignal.timeout(8000)});
     if(!response.ok)throw Error('Signature unavailable');const receipt=await response.json();
     if(!receipt.signed||receipt.revision!==1||receipt.proposalId!==p.proposalId||receipt.digest!==p.digest||JSON.stringify(I.validateDecision(receipt.decision,p.clean))!==JSON.stringify(p.decision))throw Error('Signature mismatch');
    }
    if(this.sequence!==p.seq||this.proposal!==p)throw Error('Proposal changed');this.proposal=null;return p;
   }finally{this.pendingSign=false;}
  }
 }
 return CampaignClient;
});
