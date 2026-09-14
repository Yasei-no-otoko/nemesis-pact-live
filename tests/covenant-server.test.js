'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{createHmac}=require('node:crypto'),V=require('../src/covenant.js');
const {createSessionToken}=require('../server/access.mjs');
const {ruleSetId}=require('../server/covenant-model.mjs');
const secret='fixture-session-secret-012345678901234567890123';
const env={AI_MODE:'live',OPENAI_API_KEY:'fixture-server-secret',OPENAI_MODEL:'gpt-4.1-mini',ALLOWED_ORIGIN:'https://fixture.example',APP_SESSION_SECRET:secret,OPENAI_TEXT_BUDGET_CAP_MICRODOLLARS:'1000000',OPENAI_VOICE_ENABLED:'false'};
const run=()=>new V.Run('SERVER').request('Sanctuary on the left. Slow fire. Reinforcements.');
const session=()=>{const exp=Math.floor(Date.now()/1000)+900,sid='sid-fixture',csrf=createHmac('sha256',secret).update(`csrf:${sid}:${exp}`).digest('base64url');return {sid,exp,csrf,cookie:`nemesis_app_session=${createSessionToken({secret,sid,exp})}`};};
const authHeaders=()=>{const s=session();return {origin:env.ALLOWED_ORIGIN,cookie:s.cookie,'x-nemesis-csrf':s.csrf};};
const req=(body,headers={},method='POST')=>new Request('https://fixture.example/api/covenant',{method,headers:{'content-type':'application/json',...authHeaders(),...headers},...(method==='GET'?{}:{body:JSON.stringify(body)})});
const api=()=>import('../server/covenant.mjs');
const quota={reserve:async()=>({ok:true,reservationId:'res-1'}),markStarted:async()=>({ok:true}),settle:async()=>({ok:true}),retainUnknown:async()=>({ok:true})};
const store={eval:async(_script,_keys,args)=>{const action=JSON.parse(args[0]);if(action.op==='finish')return [1,JSON.stringify({revision:action.revision,intent:action.intent,requestId:action.requestId})];return [1,JSON.stringify({revision:0,intent:action.intent,requestId:action.requestId})];}};
const deps={store,quota};
const upstream=(s=V.localProposal(run()))=>new Response(JSON.stringify({status:'completed',usage:{input_tokens:10,output_tokens:10},output:[{content:[{type:'output_text',text:JSON.stringify({version:1,ruleSet:ruleSetId(s),title:s.title,line:s.line,rationale:s.rationale})}]}]}));

test('mock mode is deterministic, non-billable, and never calls upstream',async()=>{const {handle}=await api();let calls=0;const out=await handle(new Request('https://fixture.example/api/covenant',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(run())}),{env:{AI_MODE:'mock'},fetcher:()=>{calls++;throw Error('NO NETWORK');}});const data=await out.json();assert.equal(out.status,200);assert.equal(data.provider,'local-rules');assert.equal(calls,0);assert.deepEqual(data.spec,V.localProposal(run()));});
test('live mode requires signed session cookie, CSRF and exact origin before inference',async()=>{const {handle}=await api();let calls=0;const fetcher=async()=>{calls++;return upstream();};for(const [headers,status]of [[{origin:'https://attacker.invalid'},403],[{'x-nemesis-csrf':'wrong'},403],[{cookie:''},401]]){const out=await handle(req({request:run(),runId:'run-fixture',intentVersion:1,requestId:'req-fixture'},headers),{env,fetcher,...deps});assert.equal(out.status,status);}assert.equal(calls,0);});
test('live response uses approved Responses schema and accounts through injected quota',async()=>{const {handle}=await api();let seen;const out=await handle(req({request:run(),runId:'run-fixture',intentVersion:1,requestId:'req-fixture'}),{env,fetcher:async(url,opts)=>{seen={url,opts};return upstream();},...deps});const data=await out.json();assert.equal(out.status,200);assert.equal(data.provider,'openai');assert.equal(seen.url,'https://api.openai.com/v1/responses');const body=JSON.parse(seen.opts.body);assert.equal(body.model,env.OPENAI_MODEL);assert.equal(body.store,false);assert.equal(body.text.format.strict,true);assert.equal(body.text.format.schema.additionalProperties,false);assert.equal(data.accountedMicrodollars,20);assert.ok(!JSON.stringify(data).includes(env.OPENAI_API_KEY));});
test('upstream failure or malformed output becomes explicit local rules without applying it',async()=>{const {handle}=await api();for(const fetcher of [async()=>{throw Error('offline');},async()=>new Response('{}',{status:502}),async()=>new Response(JSON.stringify({status:'completed',output:[{content:[{type:'output_text',text:'{}'}]}]}))]){const out=await handle(req({request:run(),runId:'run-fixture',intentVersion:1,requestId:'req-fixture'}),{env,fetcher,...deps});const data=await out.json();assert.equal(out.status,200);assert.equal(data.provider,'local-rules');assert.equal(data.model,null);assert.match(data.reason,/LOCAL RULES|invalid|unavailable/i);V.validateSpec(data.spec);}});
test('invalid shapes and unapproved model fail before inference',async()=>{const {handle}=await api();let calls=0;for(const body of [{request:run(),runId:'run-fixture',intentVersion:1,requestId:'req-fixture',extra:true},{request:run(),runId:'run-fixture',intentVersion:-1,requestId:'req-fixture'}]){const out=await handle(req(body),{env,fetcher:async()=>{calls++;return upstream();},...deps});assert.equal(out.status,400);}assert.equal(calls,0);assert.equal((await handle(req({request:run(),runId:'run-fixture',intentVersion:1,requestId:'req-fixture'}),{env:{...env,OPENAI_MODEL:'gpt-live-1'},fetcher:async()=>{calls++;return upstream();},...deps})).status,503);assert.equal(calls,0);});

test('Luna uses bounded standard-tier Responses and its own token prices through both provider routes',async()=>{
 const {handle,TEXT_RESERVATION}=await api();
 for(const provider of ['vercel','openai']){
  let sent,reserved,settled;
  const out=await handle(req({request:run(),runId:'luna-fixture',intentVersion:1,requestId:'req-luna'}),{env:{...env,OPENAI_MODEL:'gpt-5.6-luna',TEXT_PROVIDER:provider,AI_GATEWAY_API_KEY:'fixture-gateway'},...deps,quota:{...quota,reserve:async a=>{reserved=a;return {ok:true,reservationId:'luna-res'};},settle:async a=>{settled=a;return {ok:true};}},fetcher:async(url,options)=>{sent={url,payload:JSON.parse(options.body)};const data=await upstream().json();data.usage={input_tokens:1200,output_tokens:600,input_tokens_details:{cache_write_tokens:400,cached_tokens:100},output_tokens_details:{reasoning_tokens:500}};return Response.json(data);}});
  const data=await out.json();assert.equal(out.status,200);assert.equal(data.provider,'openai');assert.equal(data.model,'gpt-5.6-luna');
  assert.equal(sent.url,provider==='vercel'?'https://ai-gateway.vercel.sh/v1/responses':'https://api.openai.com/v1/responses');assert.equal(sent.payload.model,(provider==='vercel'?'openai/':'')+'gpt-5.6-luna');assert.deepEqual(sent.payload.reasoning,{effort:'none'});assert.equal(sent.payload.service_tier,'default');assert.equal(sent.payload.max_output_tokens,700);assert.equal(sent.payload.store,false);assert.equal(sent.payload.text.format.strict,true);
  assert.equal(reserved.estimatedMicrodollars,TEXT_RESERVATION);assert.equal(settled.actualMicrodollars,980);assert.equal(data.accountedMicrodollars,980);assert.ok(settled.actualMicrodollars<reserved.estimatedMicrodollars);
 }
});

test('Luna retains a conservative write premium when cache details are absent or invalid',async()=>{
 const {handle}=await api();
 for(const details of [undefined,{cache_write_tokens:-1},{cache_write_tokens:2000}]){
  const response=await handle(req({request:run(),runId:'luna-accounting',intentVersion:1,requestId:'req-luna-price'}),{env:{...env,OPENAI_MODEL:'gpt-5.6-luna'},...deps,fetcher:async()=>{const body=await upstream().json();body.usage={input_tokens:1200,output_tokens:600,input_tokens_details:details};return Response.json(body);}});
  assert.equal(response.status,200);assert.equal((await response.json()).accountedMicrodollars,1020);
 }
});
