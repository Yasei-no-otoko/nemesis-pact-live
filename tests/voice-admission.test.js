import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { createSessionToken } from '../server/access.mjs';
import { start } from '../server/voice.mjs';

const secret = 'voice-admission-fixture-secret-012345678901234567';
const env = {
  AI_MODE: 'live', OPENAI_API_KEY: 'fixture-key', OPENAI_VOICE_ENABLED: 'true',
  OPENAI_VOICE_MODEL: 'gpt-live-1', OPENAI_KILL_SWITCH: '0',
  APP_SESSION_SECRET: secret, ALLOWED_ORIGIN: 'https://nemesis.example'
};
const sid = 'voice_admission_sid';
const validBody = { sdp: 'v=0\\r\\nfixture', runId: 'run_voice_1', revision: 0 };

function auth({ origin = env.ALLOWED_ORIGIN, csrf = true, exp = Math.floor(Date.now() / 1000) + 900, cookie = true } = {}) {
  const headers = { 'content-type': 'application/json' };
  if (origin !== undefined && origin !== null) headers.origin = origin;
  if (cookie) headers.cookie = `nemesis_app_session=${createSessionToken({ secret, sid, exp })}`;
  if (csrf) headers['x-nemesis-csrf'] = createHmac('sha256', secret).update(`csrf:${sid}:${exp}`).digest('base64url');
  return headers;
}

function request(body = validBody, headers = auth()) {
  return new Request('https://nemesis.example/api/voice/start', {
    method: 'POST', headers, body: JSON.stringify(body)
  });
}

function fixture({ quotaResult, quotaError = false } = {}) {
  const calls = { upstream: 0, reserve: 0, markStarted: 0, retainUnknown: 0 };
  const quota = {
    async reserve() { calls.reserve++; if (quotaError) throw Error('durable store offline'); return quotaResult || { ok: true, reservationId: 'reservation_fixture' }; },
    async markStarted() { calls.markStarted++; return { ok: true }; },
    async retainUnknown() { calls.retainUnknown++; return { ok: true }; }
  };
  const fetcher = async () => { calls.upstream++; return new Response('{}', { status: 500 }); };
  return { calls, quota, fetcher };
}

test('voice admission rejects unauthenticated or malformed starts before reserve/upstream', async () => {
  const cases = [
    ['missing Origin', auth({ origin: null }), validBody, 403],
    ['missing cookie', auth({ cookie: false }), validBody, 401],
    ['wrong Origin', auth({ origin: 'https://attacker.example' }), validBody, 403],
    ['missing CSRF', auth({ csrf: false }), validBody, 403],
    ['wrong CSRF', { ...auth(), 'x-nemesis-csrf': 'wrong' }, validBody, 403],
    ['expired cookie', auth({ exp: Math.floor(Date.now() / 1000) - 1 }), validBody, 401],
    ['tampered cookie', { ...auth(), cookie: 'nemesis_app_session=eyJzaWQiOiJ2b2ljZV9hZG1pc3Npb25fc2lkIiwiZXhwIjo0MTAyNDQ0ODAwMDAwfQ.tampered' }, validBody, 401],
    ['unknown request field', auth(), { ...validBody, model: 'gpt-live-1' }, 400]
  ];
  for (const [name, headers, body, status] of cases) {
    const f = fixture();
    const response = await start(request(body, headers), { env, quota: f.quota, store: { command: async () => 'OK' }, fetcher: f.fetcher, defer: () => {} });
    assert.equal(response.status, status, name);
    const safeBody=await response.text();assert.equal(safeBody.includes(env.OPENAI_API_KEY),false);assert.equal(safeBody.includes(secret),false);
    assert.equal(f.calls.reserve, 0, `${name}: reserve must not run`);
    assert.equal(f.calls.upstream, 0, `${name}: upstream must not run`);
  }
});

test('voice admission fails closed on quota denial or durable store error', async () => {
  for (const [name, options, status] of [
    ['quota denial', { quotaResult: { ok: false, reason: 'budget' } }, 429],
    ['quota store error', { quotaError: true }, 503]
  ]) {
    const f = fixture(options);
    const response = await start(request(), { env, quota: f.quota, store: { command: async () => 'OK' }, fetcher: f.fetcher, defer: () => {} });
    assert.equal(response.status, status, name);
    const safeBody=await response.text();assert.equal(safeBody.includes(env.OPENAI_API_KEY),false);assert.equal(safeBody.includes(secret),false);
    assert.equal(f.calls.reserve, 1, `${name}: exactly one atomic reserve attempt`);
    assert.equal(f.calls.markStarted, 0, `${name}: start marker must not run`);
    assert.equal(f.calls.upstream, 0, `${name}: upstream must not run`);
  }
});
