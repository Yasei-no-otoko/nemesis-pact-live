const test = require('node:test');
const assert = require('node:assert/strict');
const PactSession = require('../src/session.js');

test('ensure creates a short lived session and does not send a token', async () => {
  const calls = [];
  const session = new PactSession({ fetch: async (path, options) => {
    calls.push({ path, options });
    return new Response(JSON.stringify({ sessionId: 's1', csrf: 'c1', expiresAt: Date.now() + 60000, contractEnabled: true, voiceEnabled: false }), { status: 200 });
  }});
  assert.deepEqual((await session.ensure()).sessionId, 's1');
  assert.equal(calls[0].path, '/api/session');
  assert.deepEqual(JSON.parse(calls[0].options.body), { consent: true });
  assert.equal(Object.hasOwn(calls[0].options.headers, 'Authorization'), false);
});

test('request adds same origin credentials and CSRF, while preserving abort signal', async () => {
  let seen;
  const session = new PactSession({ fetch: async (path, options) => {
    seen = { path, options };
    if (path === '/api/session') return new Response(JSON.stringify({ sessionId: 's1', csrf: 'c1', expiresAt: Date.now() + 60000 }), { status: 200 });
    return new Response('{}', { status: 200 });
  }});
  await session.ensure();
  const signal = new AbortController().signal;
  await session.request('/api/voice/start', { runId: 'r1' }, { signal });
  assert.equal(seen.path, '/api/voice/start');
  assert.equal(seen.options.credentials, 'same-origin');
  assert.equal(seen.options.headers['X-Nemesis-CSRF'], 'c1');
  assert.equal(seen.options.signal, signal);
  assert.deepEqual(JSON.parse(seen.options.body), { runId: 'r1' });
});

test('malformed or failed session responses fail closed', async () => {
  const bad = new PactSession({ fetch: async () => new Response(JSON.stringify({ sessionId: 'x' }), { status: 200 }) });
  await assert.rejects(bad.ensure(), /Invalid session response/);
  const failed = new PactSession({ fetch: async () => new Response('{}', { status: 503 }) });
  await assert.rejects(failed.ensure(), /Session unavailable/);
});
