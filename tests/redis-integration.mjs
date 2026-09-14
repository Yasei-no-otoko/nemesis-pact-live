import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { createRedisRestStore, createQuota } from '../server/quota.mjs';

const url = process.env.KV_REST_API_URL, token = process.env.KV_REST_API_TOKEN;
const skip = !url || !token;
const env = { OPENAI_KILL_SWITCH:'false', OPENAI_BUDGET_CAP_MICRODOLLARS:'100', OPENAI_POOL_VERIFICATION_CAP_MICRODOLLARS:'50', OPENAI_POOL_PUBLIC_CAP_MICRODOLLARS:'30', OPENAI_POOL_JUDGING_CAP_MICRODOLLARS:'20', OPENAI_TEXT_BUDGET_CAP_MICRODOLLARS:'100', OPENAI_VOICE_BUDGET_CAP_MICRODOLLARS:'100', OPENAI_MAX_CONCURRENT:'3' };
const make = () => createQuota({ store:createRedisRestStore({ url, token }), env, keyPrefix:`nemesis:test:${crypto.randomUUID()}:` });
const id = n => `${n}-${crypto.randomUUID()}`;

test('Redis Lua enforces global, pool, and kind caps', { skip }, async () => {
  const q=createQuota({store:createRedisRestStore({url,token}),env:{...env,OPENAI_MAX_CONCURRENT:'5'},keyPrefix:`nemesis:test:${crypto.randomUUID()}:`}), sid=id('s'), ip='redis-test-cap';
  assert.equal((await q.reserve({reservationId:id('a'),sid,ip,estimatedMicrodollars:30,pool:'verification',kind:'text'})).ok,true);
  assert.equal((await q.reserve({reservationId:id('b'),sid:id('s2'),ip,estimatedMicrodollars:20,pool:'verification',kind:'text'})).ok,true);
  assert.equal((await q.reserve({reservationId:id('c'),sid:id('s3'),ip,estimatedMicrodollars:30,pool:'public',kind:'text'})).ok,true);
  assert.equal((await q.reserve({reservationId:id('d'),sid:id('s4'),ip,estimatedMicrodollars:20,pool:'judging',kind:'text'})).ok,true);
  assert.equal((await q.reserve({reservationId:id('e'),sid:id('s5'),ip,estimatedMicrodollars:1,pool:'judging',kind:'text'})).reason,'budget');
  const q2=createQuota({store:createRedisRestStore({url,token}),env:{...env,OPENAI_BUDGET_CAP_MICRODOLLARS:'170',OPENAI_POOL_PUBLIC_CAP_MICRODOLLARS:'100',OPENAI_TEXT_BUDGET_CAP_MICRODOLLARS:'80'},keyPrefix:`nemesis:test:${crypto.randomUUID()}:`}); assert.equal((await q2.reserve({reservationId:id('kind'),sid:id('kind'),ip:'kind',estimatedMicrodollars:80,pool:'public',kind:'text'})).ok,true); assert.equal((await q2.reserve({reservationId:id('kind2'),sid:id('kind2'),ip:'kind',estimatedMicrodollars:1,pool:'public',kind:'text'})).reason,'budget');
});
test('Redis Lua enforces concurrent and same-session singleflight', { skip }, async () => {
  const q=make(), sid=id('busy');
  const [a,b]=await Promise.all([q.reserve({reservationId:id('a'),sid,ip:'busy',estimatedMicrodollars:1}),q.reserve({reservationId:id('b'),sid,ip:'busy',estimatedMicrodollars:1})]);
  assert.equal([a,b].filter(x=>x.ok).length,1); assert.ok([a,b].some(x=>['concurrent','session_busy'].includes(x.reason)));
});
test('duplicate, started release rejection, and one-shot text settle', { skip }, async () => {
  const q=make(), reservationId=id('life');
  assert.equal((await q.reserve({reservationId,sid:id('life'),ip:'life',estimatedMicrodollars:1})).ok,true);
  assert.equal((await q.reserve({reservationId,sid:id('life2'),ip:'life',estimatedMicrodollars:1})).reason,'duplicate');
  assert.equal((await q.markStarted({reservationId})).ok,true);
  assert.equal((await q.release({reservationId})).reason,'started');
  assert.equal((await q.settle({reservationId,actualMicrodollars:1})).ok,true);
  assert.equal((await q.settle({reservationId,actualMicrodollars:1})).reason,'settled');
});
test('voice unknown retains reservation and confirmed voice settles; 90 seconds is bounded', { skip }, async () => {
  const q=make(), sid=id('voice');
  const r=await q.reserve({reservationId:id('v1'),sid,ip:'voice',estimatedMicrodollars:1,kind:'voice',seconds:45}); assert.equal(r.ok,true); await q.markStarted({reservationId:r.reservationId}); assert.equal((await q.retainUnknown({reservationId:r.reservationId})).ok,true);
  const v2=id('v2'); assert.equal((await q.reserve({reservationId:v2,sid,ip:'voice',estimatedMicrodollars:1,kind:'voice',seconds:45})).reason,'kill');
  const q2=make(); for(let n=1;n<=2;n++){const v=id(`v${n}`);assert.equal((await q2.reserve({reservationId:v,sid,ip:'voice2',estimatedMicrodollars:1,kind:'voice',seconds:45})).ok,true);await q2.markStarted({reservationId:v});assert.equal((await q2.settle({reservationId:v,actualMicrodollars:1,terminationConfirmed:true})).ok,true)} const v3=id('v3');assert.equal((await q2.reserve({reservationId:v3,sid,ip:'voice2',estimatedMicrodollars:1,kind:'voice',seconds:45})).reason,'voice_duration');
});
