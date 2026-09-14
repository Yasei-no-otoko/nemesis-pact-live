/* Legacy endpoint is deliberately offline; authenticated covenant sessions own upstream access. */
import I from '../src/intelligence.js';
const LIMIT_BYTES=4096;
const json=(v,s=200)=>new Response(JSON.stringify(v),{status:s,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export async function handle(request,{env=process.env}={}){
 if(request.method!=='POST')return json({error:'Use POST'},405);
 if(!request.headers.get('content-type')?.toLowerCase().startsWith('application/json'))return json({error:'JSON required'},415);
 let data,bytes=0;try{const r=request.body?.getReader();if(!r)return json({error:'Body required'},400);const p=[];for(;;){const x=await r.read();if(x.done)break;bytes+=x.value.byteLength;if(bytes>LIMIT_BYTES){await r.cancel();return json({error:'Body too large'},413)}p.push(Buffer.from(x.value))}data=I.cleanRequest(JSON.parse(Buffer.concat(p).toString('utf8')))}catch{return json({error:'Invalid request'},400)}
 if(env.AI_MODE!=='live')return json({provider:'mock',fallback:false,decision:I.mock(data)});
 if(!env.OPENAI_API_KEY||!env.OPENAI_MODEL||!env.ALLOWED_ORIGIN)return json({error:'Live session endpoint required'},503);
 return json({provider:'local-rules',fallback:true,reason:'Legacy endpoint is offline; use the authenticated covenant session.',decision:I.mock(data)});
}
