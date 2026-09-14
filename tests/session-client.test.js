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

test('ensure times out a non-responsive session service and releases pending', async () => {
  let calls = 0;
  const session = new PactSession({ timeoutMs: 20, fetch: async (_path, options) => {
    calls++;
    await new Promise(() => {});
    return new Response('{}');
  }});
  await assert.rejects(session.ensure(), /Session service timeout/);
  assert.equal(session.pending, null);
  assert.equal(calls, 1);
});

test('concurrent ensure calls share one request', async () => {
  let calls = 0, release;
  const session = new PactSession({ timeoutMs: 100, fetch: async () => {
    calls++;
    await new Promise(resolve => { release = resolve; });
    return new Response(JSON.stringify({ sessionId: 's1', csrf: 'c1', expiresAt: Date.now() + 60000 }));
  }});
  const one = session.ensure(), two = session.ensure();
  await new Promise(resolve => setImmediate(resolve));
  release();
  assert.equal((await one).sessionId, 's1');
  assert.equal(calls, 1);
});

test('clear invalidates a late response and permits a fresh ensure', async () => {
  let release;
  const session = new PactSession({ timeoutMs: 20, fetch: async () => new Promise(resolve => { release = resolve; }) });
  const old = session.ensure();
  await new Promise(resolve => setImmediate(resolve));
  session.clear();
  release(new Response(JSON.stringify({ sessionId: 'old', csrf: 'old', expiresAt: Date.now() + 60000 })));
  await assert.rejects(old, /Session invalidated/);
  assert.equal(session.sessionId, null);
});

test('default fetch is bound to its global owner', async () => {
  const original = global.fetch;
  let owner;
  global.fetch = function(path, options) {
    owner = this;
    return Promise.resolve(new Response(JSON.stringify({ sessionId: 'bound', csrf: 'csrf', expiresAt: Date.now() + 60000 })));
  };
  try {
    const session = new PactSession({ timeoutMs: 100 });
    assert.equal((await session.ensure()).sessionId, 'bound');
    assert.equal(owner, globalThis);
  } finally { global.fetch = original; }
});


test('timeout covers a stalled body and ignores its late completion', async () => {
  let releaseBody;
  const session = new PactSession({ timeoutMs: 250, fetch: async () => ({
    ok: true, json: () => new Promise(resolve => { releaseBody = resolve; })
  }) });
  await assert.rejects(session.ensure(), /Session service timeout/);
  assert.equal(session.pending, null);
  releaseBody({ sessionId: 'late', csrf: 'late', expiresAt: Date.now() + 60000 });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(session.sessionId, null);
});
