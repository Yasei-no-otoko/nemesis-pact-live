// Real Redis Lua concurrency verification; isolated test keys, no model calls.
import fs from 'node:fs';import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';import {parseEnv} from 'node:util';import {createRedisRestStore,LUA} from '../server/quota.mjs';
const e=parseEnv(fs.readFileSync('.work/vercel.development.env','utf8'));const store=createRedisRestStore({url:e.KV_REST_API_URL,token:e.KV_REST_API_TOKEN});const prefix='nemesis:test:session-admission:'+randomUUID()+':';const keys=['kill','global','ip'].map(x=>prefix+x);
try{
 const results=await Promise.all(Array.from({length:24},()=>store.eval(LUA.SESSION_LUA,keys,[])));
 const accepted=results.filter(x=>Number(x[0])===1).length;assert.equal(accepted,20);assert.equal(await store.get(keys[1]),'20');assert.equal(await store.get(keys[2]),'20');
 await store.command(['SET',keys[1],'100']);assert.equal(Number((await store.eval(LUA.SESSION_LUA,[keys[0],keys[1],prefix+'another-ip'],[]))[0]),0);
 const result={checkedAt:new Date().toISOString(),store:'actual Upstash Redis',isolatedTestNamespace:true,parallelRequests:24,accepted:20,denied:4,global100LimitAlsoEnforced:true,realModelCalls:0,existingProductionCountersReset:false};fs.mkdirSync('docs/validation-current/session-admission',{recursive:true});fs.writeFileSync('docs/validation-current/session-admission/result.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
}finally{await store.command(['DEL',...keys,prefix+'another-ip']);}
