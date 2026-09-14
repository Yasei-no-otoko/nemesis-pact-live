import {randomUUID} from 'node:crypto';
import {setTimeout as delay} from 'node:timers/promises';
import {authorize,services,enabled} from './context.mjs';
import {json,readJson,id,problem,failure} from './http.mjs';

export const VOICE_MODEL='gpt-live-1', MAX_DURATION_MS=45000, RESERVE_MICRODOLLARS=50000;
export const INSTRUCTIONS=`You are THE NOTARY, the rival pilot in NEMESIS PACT. Negotiate in the player's English or Japanese, with dry wit and one or two short sentences. Stop your answer when the player interrupts and listen to the correction. Use moderate brief acknowledgments. Do not narrate combat or read JSON field names or titles.
Delegate requests and revisions to the application. It returns an unsigned canonical covenant. Never invent an accepted term while waiting. Explain only the returned advantages and price, briefly. The displayed clauses are authoritative; only clicking Sign applies them. Speech never signs. Withdrawals cancel proposals.
The only advantages are a bullet-erasing circle on left/center/right, slower hostile bullets, or stronger reflection. A circle does not stop lasers or bodies. Prices are a weaker gun, enemy reinforcements, double incoming damage, or faster boss attacks. No healing, victory or invincibility. One mid-fight amendment preserves health and time. The backend owns exact arithmetic. No other tools or rule changes exist.`;
const voiceKey=sessionId=>`nemesis:voice:${id(sessionId)}`;
async function save(store,sessionId,record){await store.command(['SET',voiceKey(sessionId),JSON.stringify(record),'EX',86400]);}
async function load(store,sessionId){const raw=await store.get(voiceKey(sessionId));return raw?JSON.parse(raw):null;}
const deadline=ms=>{const ac=new AbortController(),timer=setTimeout(()=>ac.abort(),ms);return{signal:ac.signal,done:()=>clearTimeout(timer)};};
async function hangup(sessionId,env,fetcher){
 const timeout=deadline(3000);
 try{return (await fetcher(`https://api.openai.com/v1/live/sessions/${encodeURIComponent(sessionId)}/hangup`,{method:'POST',headers:{Authorization:`Bearer ${env.OPENAI_API_KEY}`},signal:timeout.signal})).ok;}
 catch{return false;}finally{timeout.done();}
}
export async function stopOwnedSession({sessionId,sid,store,quota,env=process.env,fetcher=fetch,reason='application'}){
 const rec=await load(store,sessionId);
 if(!rec||rec.sid!==sid)throw problem('VOICE_NOT_OWNER',403);
 if(rec.state==='stopped')return{stopped:true,uncertain:false};
 const confirmed=await hangup(sessionId,env,fetcher);
 if(!confirmed){await quota.retainUnknown({reservationId:rec.reservationId});await save(store,sessionId,{...rec,state:'unknown',reason});return{stopped:false,uncertain:true};}
 // Hangup confirms termination; HTTP does not establish final usage. Keep the
 // conservative reservation. Browser seconds can never authorize a refund.
 const settled=await quota.settle({reservationId:rec.reservationId,actualMicrodollars:RESERVE_MICRODOLLARS,terminationConfirmed:true});
 if(!settled.ok&&settled.reason!=='settled')throw problem('VOICE_ACCOUNTING_UNCONFIRMED',503);
 await save(store,sessionId,{...rec,state:'stopped',stoppedAt:Date.now(),reason});
 return{stopped:true,uncertain:false,accountedMicrodollars:RESERVE_MICRODOLLARS};
}
async function watchdog(args,remaining,sleep){
 await sleep(Math.max(0,remaining));
 // Bounded server attempts. Unknown termination closes the durable admission
 // gate; reconnecting cannot clear it or erase the retained cost.
 for(let attempt=0;attempt<3;attempt++){
  try{if((await stopOwnedSession({...args,reason:'server-duration-limit'})).stopped)return;}catch{}
  if(attempt<2)await sleep(1500);
 }
 await args.quota.retainUnknown({reservationId:args.reservationId}).catch(()=>{});
}
export async function start(request,{env=process.env,fetcher=fetch,defer,sleep=delay,now=Date.now,...overrides}={}){
 let quota,reservationId,store,session,providerId,record,startedAt=now();
 try{
  enabled(env);
  if(!env.OPENAI_API_KEY||env.OPENAI_VOICE_ENABLED!=='true'||env.OPENAI_VOICE_MODEL!==VOICE_MODEL)throw problem('VOICE_NOT_ENABLED',503);
  if(typeof defer!=='function')throw problem('VOICE_WATCHDOG_REQUIRED',503);
  const data=await readJson(request,24576);
  if(Object.keys(data).some(k=>!['sdp','runId','revision'].includes(k))||typeof data.sdp!=='string'||!data.sdp.startsWith('v=0')||!Number.isInteger(data.revision)||data.revision<0||data.revision>1)throw problem('INVALID_VOICE_REQUEST');
  id(data.runId);session=authorize(request,env);({store,quota}=services(env,overrides));reservationId=randomUUID();
  const reserved=await quota.reserve({reservationId,sid:session.sid,ip:session.ip,estimatedMicrodollars:RESERVE_MICRODOLLARS,kind:'voice',seconds:45});
  if(!reserved.ok){reservationId=null;throw problem('VOICE_QUOTA_'+reserved.reason,429);}
  const marked=await quota.markStarted({reservationId});if(!marked.ok)throw problem('VOICE_RESERVATION_FAILED',503);
  const timeout=deadline(10000);let result;
  try{
   const response=await fetcher('https://api.openai.com/v1/live/sessions',{method:'POST',headers:{Authorization:`Bearer ${env.OPENAI_API_KEY}`,'Content-Type':'application/json'},signal:timeout.signal,body:JSON.stringify({session:{model:VOICE_MODEL,store:false,instructions:INSTRUCTIONS,delegation:{type:'client'},audio:{output:{voice:'marin'}}},transport:{type:'webrtc',sdp:data.sdp}})});
   if(!response.ok){
    // A rejected HTTP creation did not start a running session. Conservatively
    // retain the reservation until provider billing can be reconciled.
    const settled=await quota.settle({reservationId,actualMicrodollars:RESERVE_MICRODOLLARS,terminationConfirmed:true});
    if(settled.ok)reservationId=null;throw problem('VOICE_PROVIDER_HTTP_'+response.status,502);
   }
   result=await response.json();
  }finally{timeout.done();}
  providerId=id(result?.session?.id);const answer=result?.transport?.sdp;
  if(typeof answer!=='string'||!answer.startsWith('v=0'))throw problem('VOICE_PROVIDER_RESPONSE',502);
  record={sid:session.sid,reservationId,runId:data.runId,revision:data.revision,state:'started',startedAt,expiresAt:startedAt+MAX_DURATION_MS};
  await save(store,providerId,record);
  defer(watchdog({sessionId:providerId,sid:session.sid,reservationId,store,quota,env,fetcher},record.expiresAt-now(),sleep));
  return json({sessionId:providerId,sdp:answer,maxDurationMs:Math.max(1000,record.expiresAt-now()),model:VOICE_MODEL});
 }catch(error){
  if(reservationId&&quota){if(providerId)await hangup(providerId,env,fetcher);await quota.retainUnknown({reservationId}).catch(()=>{});}
  return failure(error);
 }
}
export async function stop(request,{env=process.env,fetcher=fetch,...overrides}={}){
 try{
  const data=await readJson(request,1024);
  if(Object.keys(data).length!==1||typeof data.sessionId!=='string')throw problem('INVALID_VOICE_STOP');
  const session=authorize(request,env),{store,quota}=services(env,overrides);
  return json(await stopOwnedSession({sessionId:data.sessionId,sid:session.sid,store,quota,env,fetcher}));
 }catch(error){return failure(error);}
}
