// Actual Redis, isolated keys: replay uses its own voice allowance without erasing budgets.
import fs from 'node:fs';import {parseEnv} from 'node:util';import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';import {createQuota,createRedisRestStore} from '../server/quota.mjs';
const credentials=parseEnv(fs.readFileSync('.work/vercel.development.env','utf8')),base=createRedisRestStore({url:credentials.KV_REST_API_URL,token:credentials.KV_REST_API_TOKEN});
const prefix='nemesis:test:voice-runs:'+randomUUID()+':',keys=new Set();
const store={eval:async(script,ks,args)=>{ks.forEach(k=>{assert.ok(k.startsWith(prefix));keys.add(k);});return base.eval(script,ks,args);},command:async args=>base.command(args)};
const env={OPENAI_BUDGET_CAP_MICRODOLLARS:'10000',OPENAI_POOL_VERIFICATION_CAP_MICRODOLLARS:'10000',OPENAI_POOL_PUBLIC_CAP_MICRODOLLARS:'0',OPENAI_POOL_JUDGING_CAP_MICRODOLLARS:'0',OPENAI_TEXT_BUDGET_CAP_MICRODOLLARS:'10000',OPENAI_VOICE_BUDGET_CAP_MICRODOLLARS:'10000',OPENAI_MAX_CONCURRENT:'3'};
const q=createQuota({store,env,keyPrefix:prefix+'quota:',admissionPrefix:prefix+'admission:'});
const request=(runId,kind='voice')=>({reservationId:randomUUID(),sid:'same-user',ip:'fixture-ip',runId,kind,estimatedMicrodollars:100});
try{
 for(let n=0;n<2;n++){const a=request('first-fight');assert.equal((await q.reserve(a)).ok,true);await q.markStarted(a);await q.settle({...a,actualMicrodollars:100,terminationConfirmed:true});}
 assert.equal((await q.reserve(request('first-fight'))).reason,'voice_duration');
 const next=request('second-fight');assert.equal((await q.reserve(next)).ok,true);assert.equal((await q.reserve(request('third-fight'))).reason,'session_busy');await q.markStarted(next);await q.settle({...next,actualMicrodollars:100,terminationConfirmed:true});
 assert.equal(await base.command(['HGET',prefix+'quota:totals','global']),'300');assert.equal(await base.command(['HGET',prefix+'admission:session:same-user','voiceSeconds']),'135');
 const unused=request('cancelled-fight');assert.equal((await q.reserve(unused)).ok,true);await q.release(unused);assert.equal(await base.command(['HGET',prefix+'admission:voice-run:same-user:cancelled-fight','voiceSeconds']),'0');assert.equal(await base.command(['HGET',prefix+'quota:totals','global']),'300');
 for(let n=0;n<8;n++){const a=request(undefined,'text');assert.equal((await q.reserve(a)).ok,true);await q.release(a);}
 assert.equal((await q.reserve(request('fourth-fight'))).reason,'session_limit');
 const report={checkedAt:new Date().toISOString(),passed:true,store:'actual Upstash Redis; isolated test keys',realModelCalls:0,checks:['two voice reservations permitted per fight; third rejected','new fight admitted under the same app identity','voice lock shared across fights','global money and session history retained','unstarted release refunds only its run allocation and reserved money','12-call app-session cap still blocks further fights'],productionCountersModified:false};fs.mkdirSync('docs/validation-current/voice-replay',{recursive:true});fs.writeFileSync('docs/validation-current/voice-replay/redis.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await base.command(['DEL',...keys]);}
