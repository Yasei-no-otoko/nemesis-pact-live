import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID, createHash } from 'node:crypto';
import { createRedisRestStore } from '../server/quota.mjs';
import { proposalStore } from '../server/proposals.mjs';

const url=process.env.KV_REST_API_URL, token=process.env.KV_REST_API_TOKEN, skip=!url||!token;
const spec={contractId:'mirror',directorId:'crossfire',terms:{}};
function setup(){const sid=randomUUID(),runId=randomUUID(),store=createRedisRestStore({url,token});return {sid,runId,store,p:proposalStore(store,sid),key:`nemesis:run:${sid}:${runId}`}}
async function cleanup(x){await x.store.command(['DEL',x.key])}

test('real Redis proposal ledger rejects late finish and stale intent',{skip},async()=>{const x=setup(),requestId=randomUUID();try{await x.p.begin({runId:x.runId,intentVersion:1,requestId,revision:0});await assert.rejects(x.p.finish({runId:x.runId,intentVersion:1,requestId:randomUUID(),revision:0,spec,provider:'local',model:'local',latencyMs:1}));await x.p.invalidate({runId:x.runId,intentVersion:2});await assert.rejects(x.p.finish({runId:x.runId,intentVersion:1,requestId,revision:0,spec,provider:'local',model:'local',latencyMs:1}));}finally{await cleanup(x)}});
test('real Redis proposal ledger makes concurrent sign one-shot and detects digest mismatch',{skip},async()=>{const x=setup(),requestId=randomUUID();try{await x.p.begin({runId:x.runId,intentVersion:1,requestId,revision:0});const proposal=await x.p.finish({runId:x.runId,intentVersion:1,requestId,revision:0,spec,provider:'local',model:'local',latencyMs:1});const wrong=createHash('sha256').update('wrong').digest('hex');await assert.rejects(x.p.sign({runId:x.runId,intentVersion:1,revision:0,proposalId:proposal.proposalId,digest:wrong}));const results=await Promise.allSettled([x.p.sign({runId:x.runId,intentVersion:1,revision:0,proposalId:proposal.proposalId,digest:proposal.digest}),x.p.sign({runId:x.runId,intentVersion:1,revision:0,proposalId:proposal.proposalId,digest:proposal.digest})]);assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal(results.filter(r=>r.status==='rejected').length,1);}finally{await cleanup(x)}});
