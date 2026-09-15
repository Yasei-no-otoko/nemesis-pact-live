import {createHash} from 'node:crypto';

// Atomic money and lease transitions. Crashed functions cannot refund calls.
const RESERVE_LUA=`
if redis.call('GET',KEYS[6])=='1' then return {0,'kill'} end
if redis.call('EXISTS',KEYS[2])==1 then return {0,'duplicate'} end
local a=cjson.decode(ARGV[1]);local now=tonumber(redis.call('TIME')[1])
for _,cap in ipairs(a.caps) do
 if tonumber(redis.call('HGET',KEYS[1],cap.field) or '0')+a.amount>cap.limit then return {0,'budget'} end
end
redis.call('ZREMRANGEBYSCORE',KEYS[5],'-inf',now)
if redis.call('ZCARD',KEYS[5])>=a.maxConcurrent then return {0,'concurrent'} end
if tonumber(redis.call('HGET',KEYS[3],'calls') or '0')>=a.sessionCalls then return {0,'session_limit'} end
if tonumber(redis.call('GET',KEYS[4]) or '0')>=a.ipCalls then return {0,'ip_limit'} end
if redis.call('EXISTS',KEYS[7])==1 then return {0,'session_busy'} end
local voiceRun=KEYS[8] or KEYS[3]
if a.kind=='voice' and tonumber(redis.call('HGET',voiceRun,'voiceSeconds') or '0')+a.seconds>90 then return {0,'voice_duration'} end
for _,cap in ipairs(a.caps) do redis.call('HINCRBY',KEYS[1],cap.field,a.amount) end
redis.call('HINCRBY',KEYS[3],'calls',1);redis.call('HINCRBY',KEYS[3],'voiceSeconds',a.seconds);redis.call('EXPIRE',KEYS[3],3600)
if a.kind=='voice' and voiceRun~=KEYS[3] then redis.call('HINCRBY',voiceRun,'voiceSeconds',a.seconds);redis.call('EXPIRE',voiceRun,3600) end
if redis.call('INCR',KEYS[4])==1 then redis.call('EXPIRE',KEYS[4],60) end
local expiry=a.kind=='voice' and 9999999999 or now+30
redis.call('ZADD',KEYS[5],expiry,a.id)
redis.call('SET',KEYS[7],a.id);if a.kind~='voice' then redis.call('EXPIRE',KEYS[7],30) end
a.state='reserved';a.createdAt=now;a.lock=KEYS[7];a.session=KEYS[3];a.voiceRun=voiceRun
redis.call('SET',KEYS[2],cjson.encode(a),'EX',604800)
return {1,'reserved'}`;

const TRANSITION_LUA=`
local raw=redis.call('GET',KEYS[2]);if not raw then return {0,'unknown'} end
local r=cjson.decode(raw);local action=ARGV[1]
if action=='start' then
 if r.state~='reserved' then return {0,r.state} end
 r.state='started'
elseif action=='unknown' then
 if r.state~='started' and r.state~='reserved' and r.state~='unknown' then return {0,r.state} end
 r.state='unknown'
 if r.kind=='voice' then redis.call('SET',KEYS[4],'1') end
elseif action=='release' or action=='settle' then
 if action=='release' and r.state~='reserved' then return {0,r.state} end
 if r.state=='settled' or r.state=='released' then return {0,r.state} end
 local actual=action=='release' and 0 or tonumber(ARGV[2])
 if not actual or actual<0 or actual>r.amount or actual~=math.floor(actual) then redis.call('SET',KEYS[4],'1');return {0,'overrun'} end
 if action=='settle' and r.kind=='voice' and ARGV[3]~='confirmed' then return {0,'termination_unconfirmed'} end
 for _,cap in ipairs(r.caps) do redis.call('HINCRBY',KEYS[1],cap.field,actual-r.amount) end
 redis.call('ZREM',KEYS[3],r.id)
 if redis.call('GET',r.lock)==r.id then redis.call('DEL',r.lock) end
 if action=='release' then
  redis.call('HINCRBY',r.session,'voiceSeconds',-r.seconds)
  if r.voiceRun and r.voiceRun~=r.session and r.kind=='voice' then redis.call('HINCRBY',r.voiceRun,'voiceSeconds',-r.seconds) end
 end
 r.state=action=='release' and 'released' or 'settled';r.actual=actual
else return {0,'operation'} end
redis.call('SET',KEYS[2],cjson.encode(r),'EX',604800)
return {1,r.state}`;

const SESSION_LUA=`
if redis.call('GET',KEYS[1])=='1' then return {0,'kill'} end
if tonumber(redis.call('GET',KEYS[2]) or '0')>=100 or tonumber(redis.call('GET',KEYS[3]) or '0')>=20 then return {0,'issue_limit'} end
if redis.call('INCR',KEYS[2])==1 then redis.call('EXPIRE',KEYS[2],3600) end
if redis.call('INCR',KEYS[3])==1 then redis.call('EXPIRE',KEYS[3],3600) end
return {1,'issued'}`;

export function createRedisRestStore({url,token,fetcher=fetch,timeoutMs=2500}={}) {
  if(!url||!token||new URL(url).protocol!=='https:')throw Error('HTTPS Redis REST credentials required');
  async function command(parts) {
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs);
    try {
      const r=await fetcher(url.replace(/\/$/,''),{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify(parts.map(String)),signal:controller.signal});
      const b=await r.json();if(!r.ok||b.error||!Object.hasOwn(b,'result'))throw Error('Quota store unavailable');return b.result;
    }finally{clearTimeout(timer);}
  }
  return {command,eval:(script,keys,args)=>command(['EVAL',script,keys.length,...keys,...args]),get:key=>command(['GET',key]),set:(key,value)=>command(['SET',key,value])};
}
const integer=(env,key,zero=false)=>{const n=Number(env[key]);if(env[key]===undefined||env[key]===''||!Number.isSafeInteger(n)||n<(zero?0:1))throw Error(`Explicit ${key} required`);return n;};
const safe=value=>{if(typeof value!=='string'||!/^[A-Za-z0-9:_-]{1,180}$/.test(value))throw Error('Invalid quota identity');return value;};
export function createQuota({store,env,keyPrefix='nemesis:quota:',admissionPrefix=keyPrefix}={}) {
  if(!store?.eval)throw Error('Durable quota store required');
  const total=integer(env,'OPENAI_BUDGET_CAP_MICRODOLLARS');
  const pools=Object.fromEntries(['verification','public','judging'].map(p=>[p,integer(env,`OPENAI_POOL_${p.toUpperCase()}_CAP_MICRODOLLARS`,true)]));
  if(Object.values(pools).reduce((a,b)=>a+b,0)>total)throw Error('Budget allocations exceed total');
  const kinds=Object.fromEntries(['text','voice'].map(k=>[k,integer(env,`OPENAI_${k.toUpperCase()}_BUDGET_CAP_MICRODOLLARS`,true)]));
  const maxConcurrent=integer(env,'OPENAI_MAX_CONCURRENT'),key=x=>keyPrefix+x,shared=x=>admissionPrefix+x;
  const killed=()=>['true','1'].includes(env.OPENAI_KILL_SWITCH);
  const result=(o,extra={})=>({ok:Number(o?.[0])===1,reason:o?.[1]||'store',...extra});
  async function transition(reservationId,action,actual=0,confirmed=false) {
    return result(await store.eval(TRANSITION_LUA,[key('totals'),key(`reservation:${safe(reservationId)}`),shared('active'),shared('kill')],[action,actual,confirmed?'confirmed':'unconfirmed']));
  }
  return {
    async reserve({reservationId,sid,ip,estimatedMicrodollars,kind='text',pool=env.OPENAI_BUDGET_POOL||'verification',seconds=kind==='voice'?45:0,runId}) {
      safe(reservationId);safe(sid);const hashedIp=createHash('sha256').update(String(ip)).digest('hex');
      const amount=Number(estimatedMicrodollars);
      if(!Object.hasOwn(kinds,kind)||!Object.hasOwn(pools,pool)||!Number.isSafeInteger(amount)||amount<1||!Number.isInteger(seconds)||seconds<0||seconds>45)throw Error('Invalid reservation');
      if(killed())return {ok:false,reason:'kill'};
      const caps=[{field:'global',limit:total},{field:`pool:${pool}`,limit:pools[pool]},{field:`kind:${kind}`,limit:kinds[kind]}];
      const voiceRun=kind==='voice'&&runId!==undefined?shared(`voice-run:${sid}:${safe(runId)}`):shared(`session:${sid}`);
      const data={id:reservationId,sid,kind,pool,amount,caps,seconds,runId,maxConcurrent,sessionCalls:48,ipCalls:20};
      const o=await store.eval(RESERVE_LUA,[key('totals'),key(`reservation:${reservationId}`),shared(`session:${sid}`),shared(`ip:${hashedIp}`),shared('active'),shared('kill'),shared(`lock:${sid}:${kind}`),voiceRun],[JSON.stringify(data)]);
      return result(o,{reservationId,reservedMicrodollars:amount});
    },
    async reserveSession({ip}) {if(killed())return false;const hash=createHash('sha256').update(String(ip)).digest('hex');return Number((await store.eval(SESSION_LUA,[shared('kill'),shared('session-issues'),shared(`ip-issues:${hash}`)],[]))?.[0])===1;},
    markStarted:({reservationId})=>transition(reservationId,'start'),
    retainUnknown:({reservationId})=>transition(reservationId,'unknown'),
    settle:({reservationId,actualMicrodollars,terminationConfirmed=false})=>transition(reservationId,'settle',actualMicrodollars,terminationConfirmed),
    release:({reservationId})=>transition(reservationId,'release'),
    kill:enabled=>store.set(shared('kill'),enabled?'1':'0'),
    snapshot:()=>store.command(['HGETALL',key('totals')])
  };
}
export const LUA={RESERVE_LUA,TRANSITION_LUA,SESSION_LUA};
