import test from 'node:test';
import assert from 'node:assert/strict';
import { issueSession, readSession, requireCsrf } from '../server/access.mjs';

const env = { APP_SESSION_SECRET: 'x'.repeat(40), ALLOWED_ORIGIN: 'https://game.example', APP_SESSION_TTL_SECONDS: '600', APP_SESSION_SECURE: 'false' };
const req = (headers = {}) => new Request('https://game.example/api/session', { method: 'POST', headers: { origin: env.ALLOWED_ORIGIN, ...headers } });
test('issues random signed HttpOnly Strict cookie and validates CSRF', async () => {
  const quota = { reserveSession: async () => true };
  const a = await issueSession({ request: req(), env, quota, ip: '1.2.3.4', now: 100000 });
  assert.match(a.cookie, /HttpOnly; SameSite=Strict/);
  assert.notEqual(a.sid, (await issueSession({ request: req(), env, quota, ip: '1.2.3.4', now: 100000 })).sid);
  const session = readSession(new Request('https://game.example', { headers: { cookie: a.cookie } }), env, { now: 100000 });
  assert.equal(session.sid, a.sid);
  requireCsrf(new Request('https://game.example', { headers: { 'x-nemesis-csrf': a.csrf } }), session);
  assert.throws(() => requireCsrf(new Request('https://game.example', { headers: { 'x-nemesis-csrf': 'wrong' } }), session), /CSRF/);
});
test('rejects wrong Origin and missing durable quota', async () => {
  await assert.rejects(issueSession({ request: req({ origin: 'https://evil.example' }), env, quota: { reserveSession: async () => true }, ip: 'x' }), /Origin/);
  await assert.rejects(issueSession({ request: req(), env, ip: 'x' }), /Durable quota/);
});
