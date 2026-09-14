import {issueSession,assertOrigin,readSession} from './access.mjs';
import {services,ipKey,enabled} from './context.mjs';
import {json,readJson,problem,failure} from './http.mjs';
export async function handle(request,{env=process.env,...overrides}={}) {
  try {
    const data=await readJson(request,256);
    if(data?.consent!==true||Object.keys(data).some(k=>k!=='consent'))throw problem('CONSENT_REQUIRED');
    assertOrigin(request,env);enabled(env);
    const {quota}=services(env,overrides);
    let session,cookie;
    try {session=readSession(request,env);}catch{}
    if(!session){session=await issueSession({request,env,quota,ip:ipKey(request,env)});cookie=session.cookie;}
    return json({sessionId:session.sid,csrf:session.csrf,expiresAt:session.exp*1000,contractEnabled:!!env.OPENAI_MODEL,voiceEnabled:env.OPENAI_VOICE_ENABLED==='true'&&env.OPENAI_VOICE_MODEL==='gpt-live-1'},200,cookie?{'Set-Cookie':cookie}:{});
  }catch(error){return failure(error);}
}
