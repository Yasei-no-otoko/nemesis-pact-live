import {authorize,services} from './context.mjs';
import {json,readJson,failure,problem} from './http.mjs';
import {proposalStore,intent} from './proposals.mjs';
export async function handle(request,action,{env=process.env,...overrides}={}) {
  try {
    const data=intent(await readJson(request,1024));
    const session=authorize(request,env),{store}=services(env,overrides);
    const ledger=proposalStore(store,session.sid);
    if(action==='sign') {
      if(Object.keys(data).some(k=>!['runId','intentVersion','revision','proposalId','digest'].includes(k)))throw problem('INVALID_SIGN');
      return json(await ledger.sign(data));
    }
    if(Object.keys(data).some(k=>!['runId','intentVersion'].includes(k)))throw problem('INVALID_CANCEL');
    await ledger.invalidate(data);return json({invalidated:true});
  }catch(error){return failure(error);}
}
