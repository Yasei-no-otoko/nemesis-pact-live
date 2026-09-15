import {randomUUID, createHash} from 'node:crypto';
import {id,problem} from './http.mjs';

// The shared ledger is the authority for intent and signature ordering. Model
// prose never writes this state. All transitions are a single atomic script.
export const TRANSITION_LUA=`
local key=KEYS[1]
local state=redis.call('GET',key)
local s=state and cjson.decode(state) or {revision=0,intent=-1}
local a=cjson.decode(ARGV[1])
if a.op=='begin' then
 if a.revision~=s.revision or a.intent<=s.intent then return {0,'stale'} end
 s.intent=a.intent;s.requestId=a.requestId;s.proposal=nil;s.signed=nil
elseif a.op=='invalidate' then
 if a.intent>s.intent then s.intent=a.intent;s.requestId=nil;s.proposal=nil end
elseif a.op=='finish' then
 if a.revision~=s.revision or a.intent~=s.intent or a.requestId~=s.requestId then return {0,'stale'} end
 if s.proposal then return {0,'duplicate'} end
 s.proposal=a.proposal
elseif a.op=='sign' then
 if a.revision~=s.revision or a.intent~=s.intent or not s.proposal or a.proposalId~=s.proposal.proposalId or a.digest~=s.proposal.digest then return {0,'stale'} end
 s.revision=s.revision+1;s.signed=s.proposal;s.proposal=nil;s.requestId=nil
else return {0,'operation'} end
redis.call('SET',key,cjson.encode(s),'EX',tonumber(ARGV[2]))
return {1,cjson.encode(s)}`;

export function proposalStore(store,sid,namespace='run') {
  if(!['run','director'].includes(namespace))throw problem('INVALID_NAMESPACE');
  const key=runId=>`nemesis:${namespace}:${id(sid)}:${id(runId)}`;
  async function transition(runId,action) {
    const result=await store.eval(TRANSITION_LUA,[key(runId)],[JSON.stringify(action),'3600']);
    if(Number(result?.[0])!==1)throw problem('PROPOSAL_SUPERSEDED',409);
    return JSON.parse(result[1]);
  }
  return {
    begin:({runId,intentVersion,requestId,revision})=>transition(runId,{op:'begin',intent:intentVersion,requestId:id(requestId),revision}),
    invalidate:({runId,intentVersion})=>transition(runId,{op:'invalidate',intent:intentVersion}),
    async finish({runId,intentVersion,requestId,revision,spec,provider,model,latencyMs}) {
      const proposal={proposalId:randomUUID(),digest:createHash('sha256').update(JSON.stringify(spec)).digest('hex'),spec,provider,model,latencyMs,intentVersion,requestId};
      await transition(runId,{op:'finish',intent:intentVersion,requestId,revision,proposal});
      return proposal;
    },
    async sign({runId,intentVersion,revision,proposalId,digest}) {
      const s=await transition(runId,{op:'sign',intent:intentVersion,revision,proposalId:id(proposalId),digest});
      return {...s.signed,revision:s.revision,signed:true};
    }
  };
}
export function intent(data) {
  id(data.runId);
  if(!Number.isSafeInteger(data.intentVersion)||data.intentVersion<0||data.intentVersion>10000)throw problem('INVALID_INTENT');
  if(data.revision!==undefined&&(!Number.isInteger(data.revision)||data.revision<0||data.revision>1))throw problem('INVALID_REVISION');
  return data;
}
