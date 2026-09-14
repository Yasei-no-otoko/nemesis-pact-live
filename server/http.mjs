export function json(value, status=200, headers={}) {
  return new Response(JSON.stringify(value), {status, headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
}
export function failure(error) {
  return json({error:error?.code || 'SERVICE_UNAVAILABLE',localRules:true}, error?.status || 503);
}
export function problem(code,status=400) { return Object.assign(new Error(code),{code,status}); }
export async function readJson(request, maxBytes=8192) {
  if(request.method!=='POST') throw problem('USE_POST',405);
  if(!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) throw problem('JSON_REQUIRED',415);
  if(Number(request.headers.get('content-length')||0)>maxBytes) throw problem('BODY_TOO_LARGE',413);
  const reader=request.body?.getReader(); if(!reader) throw problem('BODY_REQUIRED');
  const chunks=[];let size=0;
  for(;;) {const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>maxBytes){await reader.cancel();throw problem('BODY_TOO_LARGE',413);}chunks.push(Buffer.from(value));}
  try {return JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw problem('INVALID_JSON');}
}
export function id(value) {
  if(typeof value!=='string'||!/^[A-Za-z0-9_-]{8,100}$/.test(value))throw problem('INVALID_ID');
  return value;
}
