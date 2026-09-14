import crypto from 'node:crypto';

const COOKIE = 'nemesis_app_session';
const DAY = 24 * 60 * 60;

function b64url(value) { return Buffer.from(value).toString('base64url'); }
function unb64url(value) { return Buffer.from(value, 'base64url').toString('utf8'); }
function hmac(secret, value) { return crypto.createHmac('sha256', secret).update(value).digest('base64url'); }
function timingSafe(a, b) {
  const aa = Buffer.from(a || ''), bb = Buffer.from(b || '');
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}
function cookieHeader(request) {
  return request.headers.get('cookie') || '';
}
function cookieValue(request, name) {
  const item = cookieHeader(request).split(';').map(x => x.trim()).find(x => x.startsWith(`${name}=`));
  return item ? item.slice(name.length + 1) : null;
}
function config(env) {
  const secret = env.APP_SESSION_SECRET;
  const origin = env.ALLOWED_ORIGIN;
  if (!secret || secret.length < 32 || !origin || !/^https:\/\/[^/]+$/.test(origin)) throw new Error('APP_SESSION_SECRET and exact HTTPS ALLOWED_ORIGIN are required');
  return { secret, origin, ttl: Math.min(3600, Math.max(60, Number(env.APP_SESSION_TTL_SECONDS || 900) || 900)), secure: true };
}

export function assertOrigin(request, env) {
  const { origin } = config(env);
  if (request.headers.get('origin') !== origin) throw Object.assign(new Error('Origin rejected'), { code: 'ORIGIN_REJECTED', status: 403 });
}

export function createSessionToken({ secret, sid, exp }) {
  const body = b64url(JSON.stringify({ sid, exp }));
  return `${body}.${hmac(secret, body)}`;
}

export function readSession(request, env, { now = Date.now() } = {}) {
  const { secret } = config(env);
  const raw = cookieValue(request, COOKIE);
  if (!raw) throw Object.assign(new Error('Session required'), { code: 'SESSION_REQUIRED', status: 401 });
  const [body, sig] = raw.split('.');
  if (raw.split('.').length!==2 || !body || !sig || !timingSafe(sig, hmac(secret, body))) throw Object.assign(new Error('Invalid session'), { code: 'SESSION_INVALID', status: 401 });
  let data;
  try { data = JSON.parse(unb64url(body)); } catch { throw Object.assign(new Error('Invalid session'), { code: 'SESSION_INVALID', status: 401 }); }
  if (typeof data.sid!=='string'||!/^[A-Za-z0-9_-]{8,100}$/.test(data.sid) || !Number.isInteger(data.exp) || data.exp <= Math.floor(now / 1000)) throw Object.assign(new Error('Session expired'), { code: 'SESSION_EXPIRED', status: 401 });
  return { sid: data.sid, exp: data.exp, csrf: hmac(secret, `csrf:${data.sid}:${data.exp}`) };
}

/** Issue a cookie only after the caller has atomically reserved a durable session slot. */
export async function issueSession({ request, env, quota, ip, now = Date.now() }) {
  assertOrigin(request, env);
  const { secret, origin, ttl, secure } = config(env);
  if (!quota || typeof quota.reserveSession !== 'function') throw new Error('Durable quota adapter required');
  const sid = crypto.randomBytes(24).toString('hex');
  const exp = Math.floor(now / 1000) + ttl;
  const allowed = await quota.reserveSession({ sid, ip: String(ip || 'unknown'), exp, now: Math.floor(now / 1000) });
  if (!allowed) throw Object.assign(new Error('Session quota unavailable'), { code: 'SESSION_QUOTA', status: 429 });
  const token = createSessionToken({ secret, sid, exp });
  const cookie = `${COOKIE}=${token}; Max-Age=${ttl}; Path=/; HttpOnly; SameSite=Strict${secure ? '; Secure' : ''}`;
  return { sid, exp, csrf: hmac(secret, `csrf:${sid}:${exp}`), cookie, origin };
}

export function requireCsrf(request, session) {
  const supplied = request.headers.get('x-nemesis-csrf');
  if (!supplied || !timingSafe(supplied, session.csrf)) throw Object.assign(new Error('CSRF rejected'), { code: 'CSRF_REJECTED', status: 403 });
}

export { COOKIE };
