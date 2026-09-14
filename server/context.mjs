import {createHmac} from 'node:crypto';
import {createQuota,createRedisRestStore} from './quota.mjs';
import {assertOrigin,readSession,requireCsrf} from './access.mjs';
import {problem} from './http.mjs';
export function services(env=process.env,overrides={}) {
  const store=overrides.store || createRedisRestStore({url:env.REDIS_REST_URL || env.KV_REST_API_URL,token:env.REDIS_REST_TOKEN || env.KV_REST_API_TOKEN});
  const gateway=overrides.billing==='vercel';
  const budgetEnv=gateway?Object.fromEntries(Object.entries(env).filter(([key])=>key.startsWith('GATEWAY_')).map(([key,value])=>[key.replace(/^GATEWAY_/,'OPENAI_'),value])):env;
  return {store,quota:overrides.quota || createQuota({store,env:budgetEnv,keyPrefix:gateway?'nemesis:gateway:':'nemesis:quota:',admissionPrefix:'nemesis:admission:'})};
}
export function ipKey(request,env) {
  const address=request.headers.get('x-vercel-forwarded-for') || request.headers.get('x-forwarded-for') || 'unknown';
  return createHmac('sha256',env.APP_SESSION_SECRET).update(address.split(',')[0].trim().slice(0,128)).digest('hex');
}
export function authorize(request,env) {
  assertOrigin(request,env);
  const session=readSession(request,env);
  requireCsrf(request,session);
  return {...session,ip:ipKey(request,env)};
}
export function enabled(env) {
  if(env.AI_MODE!=='live'||['1','true'].includes(env.OPENAI_KILL_SWITCH))throw problem('LOCAL_RULES_ONLY',503);
  if(!env.OPENAI_API_KEY&&!(env.TEXT_PROVIDER==='vercel'&&env.AI_GATEWAY_API_KEY))throw problem('MODEL_NOT_CONFIGURED',503);
}
