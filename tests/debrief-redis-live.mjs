// Explicit opt-in integration: isolated ephemeral keys, no global budget mutation.
import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';import fs from 'node:fs';
import {createRedisRestStore} from '../server/quota.mjs';import {DEBRIEF_LUA as L} from '../server/debrief.mjs';
const store=createRedisRestStore({url:process.env.KV_REST_API_URL||process.env.REDIS_REST_URL,token:process.env.KV_REST_API_TOKEN||process.env.REDIS_REST_TOKEN});
const key='nemesis:test:debrief:'+randomUUID(),checks=[];
try{
 const starts=await Promise.all([store.eval(L.PREP,[key],['1','one']),store.eval(L.PREP,[key],['1','one'])]);
 assert.equal(starts.filter(x=>Number(x[0])===1).length,1);checks.push('atomic duplicate admission');
 assert.equal(Number(await store.eval(L.ABORT,[key],['0','old'])),0);
 assert.equal(Number((await store.eval(L.SAVE,[key],['1','one',JSON.stringify({provider:'fixture'})]))[0]),1);
 const cached=await store.eval(L.PREP,[key],['1','one']);assert.equal(cached[1],'duplicate');assert.equal(JSON.parse(cached[2]).result.provider,'fixture');checks.push('cached result and stale owner rejection');
 assert.equal(Number((await store.eval(L.PREP,[key],['2','two']))[0]),1);
 assert.equal(Number(await store.eval(L.ABORT,[key],['1','one'])),0);
 assert.equal(Number(await store.eval(L.ABORT,[key],['2','two'])),1);
 assert.equal(Number((await store.eval(L.PREP,[key],['2','two']))[0]),1);checks.push('matching pre-start failure can retry');
}finally{await store.command(['DEL',key]);}
const report={checkedAt:new Date().toISOString(),realRedis:true,paidApiCalls:0,isolatedKeysRemoved:true,checks};fs.mkdirSync('docs/validation-debrief',{recursive:true});fs.writeFileSync('docs/validation-debrief/redis.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
