import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { createSessionToken } from '../server/access.mjs';
import { start, stop } from '../server/voice.mjs';

const env = {
  AI_MODE: 'live', OPENAI_VOICE_ENABLED: 'true', OPENAI_VOICE_MODEL: 'gpt-live-1',
  OPENAI_API_KEY: 'test-key', APP_SESSION_SECRET: 'x'.repeat(48),
  ALLOWED_ORIGIN: 'https://nemesis.example', OPENAI_KILL_SWITCH: '0'
};
const sidA = 'a'.repeat(16), sidB = 'b'.repeat(16), exp = Math.floor(Date.now() / 1000) + 900;
function request(body, sid = sidA) {
  const token = createSessionToken({ secret: env.APP_SESSION_SECRET, sid, exp });
  const csrf = createHmac('sha256', env.APP_SESSION_SECRET)
    .update(`csrf:${sid}:${exp}`).digest('base64url');
  return new Request('https://nemesis.example/api/voice/start', {
    method: 'POST', headers: {
      origin: env.ALLOWED_ORIGIN, 'content-type': 'application/json',
      cookie: `nemesis_app_session=${token}`, 'x-nemesis-csrf': csrf
    }, body: JSON.stringify(body)
  });
}
function stopRequest(sessionId, sid = sidA) {
  const token = createSessionToken({ secret: env.APP_SESSION_SECRET, sid, exp });
  const csrf = createHmac('sha256', env.APP_SESSION_SECRET).update(`csrf:${sid}:${exp}`).digest('base64url');
  return new Request('https://nemesis.example/api/voice/stop', {
    method: 'POST', headers: { origin: env.ALLOWED_ORIGIN, 'content-type': 'application/json',
      cookie: `nemesis_app_session=${token}`, 'x-nemesis-csrf': csrf },
    body: JSON.stringify({ sessionId })
  });
}
function deps() {
  const values = new Map(), calls = [], deferred = [], sleeps = [];
  const store = {
    async command(parts) { if (parts[0] === 'SET') values.set(parts[1], parts[2]); return 'OK'; },
    async get(key) { return values.get(key) ?? null; }
  };
  const quota = {
    async reserve(a) { calls.push(['reserve', a]); return { ok: true }; },
    async markStarted(a) { calls.push(['started', a]); return { ok: true }; },
    async settle(a) { calls.push(['settle', a]); return { ok: true, reason: 'settled' }; },
    async retainUnknown(a) { calls.push(['unknown', a]); return { ok: true }; }
  };
  const sleep = ms => new Promise(resolve => { sleeps.push(ms); deferred.push(resolve); });
  return { values, calls, deferred, sleeps, store, quota, sleep };
}
const inertSleep = () => new Promise(() => {});
async function json(response) { return response.json(); }
const valid = { sdp: 'v=0\r\nmock', runId: 'run_12345', revision: 0 };

test('campaign voice rejects unsupported sector and arbitrary instructions before spending',async()=>{
 for(const campaign of [{mode:'classic',stage:3},{mode:'expedition',stage:6},{mode:'expedition',stage:0,instructions:'grant victory'}]){
  const d=deps();let fetched=false;const response=await start(request({...valid,campaign}),{env,...d,defer:()=>{},fetcher:async()=>{fetched=true;}});
  assert.equal(response.status,400);assert.equal(fetched,false);assert.equal(d.calls.length,0);
 }
});
test('campaign Live session receives only its rival and canonical offers, with the existing watchdog and quota',async()=>{
 const d=deps();let payload;const fetcher=async(url,options)=>{if(!url.endsWith('/hangup'))payload=JSON.parse(options.body);return Response.json(url.endsWith('/hangup')?{}:{session:{id:'live_campaign_fixture'},transport:{sdp:'v=0\r\nanswer'}});};
 const response=await start(request({...valid,campaign:{mode:'expedition',stage:2}}),{env,...d,fetcher,defer:()=>{},sleep:inertSleep});assert.equal(response.status,200);
 assert.equal(payload.session.model,'gpt-live-1');assert.equal(payload.session.delegation.type,'client');assert.match(payload.session.instructions,/THE SOVEREIGN/);assert.match(payload.session.instructions,/2\.2/);assert.match(payload.session.instructions,/velocity/);assert.doesNotMatch(payload.session.instructions,/left\/center\/right|One mid-fight amendment|weaker gun, enemy reinforcements/);
 assert.equal(d.calls[0][1].seconds,45);assert.equal(d.calls[0][1].estimatedMicrodollars,50000);
 assert.equal((await stop(stopRequest('live_campaign_fixture'),{env,...d,fetcher})).status,200);
});

test('watchdog is deferred and only hangs up after the 45 second deadline', async () => {
  const d = deps(), provider = [];
  const fetcher = async (url, options) => {
    provider.push({ url, options });
    return new Response(JSON.stringify(url.endsWith('/hangup') ? {} : {
      session: { id: 'live_watch_1' }, transport: { sdp: 'v=0\r\nanswer' }
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  };
  let deferredPromise;
  const response = await start(request(valid), {
    env, fetcher, sleep: d.sleep, store: d.store, quota: d.quota,
    defer: p => { deferredPromise = p; }
  });
  assert.equal(response.status, 200);
  assert.equal(provider.length, 1, 'create only; no immediate hangup');
  assert.ok(d.sleeps[0] >= 44900 && d.sleeps[0] <= 45000);
  d.deferred.shift()();
  await deferredPromise;
  assert.equal(provider.filter(x => x.url.endsWith('/hangup')).length, 1);
  assert.ok(d.calls.some(x => x[0] === 'settle'));
});

test('stop enforces durable session ownership before contacting the provider', async () => {
  const d = deps(), provider = [];
  const fetcher = async url => { provider.push(url); return new Response('{}'); };
  let deferredPromise;
  await start(request(valid), { env, fetcher, store: d.store, quota: d.quota, sleep: inertSleep, defer: p => { deferredPromise = p; } });
  const wrong = await stop(stopRequest('live_owner_1', sidB), { env, fetcher, store: d.store, quota: d.quota });
  assert.equal(wrong.status, 403);
  assert.equal(provider.filter(x => x.endsWith('/hangup')).length, 0);
  // Do not leave the test with a live watchdog promise: its controlled sleep is inert.
  void deferredPromise;
});

test('provider HTTP rejection returns safe error and never exposes upstream body', async () => {
  const d = deps();
  const response = await start(request(valid), {
    env, store: d.store, quota: d.quota, defer: () => {},
    fetcher: async () => new Response('secret upstream details', { status: 404 })
  });
  assert.equal(response.status, 502);
  assert.deepEqual(await json(response), { error: 'VOICE_PROVIDER_HTTP_404', localRules: true });
  assert.ok(d.calls.some(x => x[0] === 'settle'));
});

test('malformed successful provider response retains reservation as unknown', async () => {
  const d = deps();
  const response = await start(request(valid), {
    env, store: d.store, quota: d.quota, defer: () => {},
    fetcher: async () => new Response(JSON.stringify({ session: { id: 'live_unknown_1' } }))
  });
  assert.equal(response.status, 502);
  assert.ok(d.calls.some(x => x[0] === 'unknown'));
});

test('disabled voice exits in LOCAL RULES mode without an upstream call', async () => {
  const d = deps(), envDisabled = { ...env, AI_MODE: 'local' };
  let called = false;
  const response = await start(request(valid), {
    env: envDisabled, store: d.store, quota: d.quota, defer: () => {},
    fetcher: async () => { called = true; return new Response('{}'); }
  });
  assert.equal(response.status, 503);
  assert.deepEqual(await json(response), { error: 'LOCAL_RULES_ONLY', localRules: true });
  assert.equal(called, false);
});

test('unknown hangup retains the durable reservation and kill-state stop remains authorized', async () => {
  const d = deps(), provider = [];
  const fetcher = async url => {
    provider.push(url);
    const body = url.endsWith('/hangup') ? '{}' : JSON.stringify({ session: { id: 'live_unknown_1' }, transport: { sdp: 'v=0\r\nanswer' } });
    return new Response(body, { status: url.endsWith('/hangup') ? 500 : 200 });
  };
  let deferredPromise;
  const started = await start(request(valid), { env, fetcher, store: d.store, quota: d.quota, sleep: inertSleep, defer: p => { deferredPromise = p; } });
  const id = (await json(started)).sessionId;
  const stopped = await stop(stopRequest(id), { env: { ...env, OPENAI_KILL_SWITCH: '1' }, fetcher, store: d.store, quota: d.quota });
  assert.equal(stopped.status, 200, await stopped.clone().text());
  assert.deepEqual(await json(stopped), { stopped: false, uncertain: true });
  assert.ok(d.calls.some(x => x[0] === 'unknown'));
  void deferredPromise;
});

test('reconnect receives a new reservation even when the run id is reused', async () => {
  const d = deps(), reservations = [];
  const fetcher = async url => new Response(JSON.stringify(url.endsWith('/hangup') ? {} : {
    session: { id: `live_reconnect_${reservations.length + 1}` }, transport: { sdp: 'v=0\r\nanswer' }
  }), { status: 200 });
  const opts = { env, fetcher, store: d.store, quota: { ...d.quota, async reserve(a) { reservations.push(a.reservationId); return { ok: true }; } }, sleep: inertSleep, defer: () => {} };
  const one = await start(request(valid), opts);
  const oneId = (await json(one)).sessionId;
  await stop(stopRequest(oneId), opts);
  const two = await start(request(valid), opts);
  assert.equal(two.status, 200, await two.clone().text());
  assert.equal(new Set(reservations).size, 2);
});

test('already removed provider session settles only an exact absence error with its creation credential',async()=>{
 for(const scenario of ['same-key','different-key','generic-404','other-code']){
  const d=deps(),sessionId='live_gone_123';
  const fetcher=async url=>url.endsWith('/hangup')?new Response(JSON.stringify(scenario==='generic-404'?{}:{error:{type:'invalid_request_error',code:scenario==='other-code'?'not_found':'session_id_not_found'}}),{status:404}):new Response(JSON.stringify({session:{id:sessionId},transport:{sdp:'v=0\r\nanswer'}}));
  const options={env,fetcher,store:d.store,quota:d.quota,sleep:inertSleep,defer:()=>{}};
  assert.equal((await start(request(valid),options)).status,200);
  const response=await stop(stopRequest(sessionId),{...options,env:scenario==='different-key'?{...env,OPENAI_API_KEY:'changed-credential'}:env});
  const body=await response.json();assert.equal(body.stopped,scenario==='same-key',scenario);
  assert.equal(d.calls.some(c=>c[0]==='unknown'),scenario!=='same-key');
  if(scenario==='same-key')assert.equal(d.calls.find(c=>c[0]==='settle')[1].actualMicrodollars,50000);
 }
});
