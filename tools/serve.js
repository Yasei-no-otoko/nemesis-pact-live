'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),{Readable}=require('node:stream');
const root=path.resolve(__dirname,'../public'),port=Number(process.env.PORT||8080),lan=process.argv.includes('--lan'),host=lan?'0.0.0.0':'127.0.0.1';
if(!Number.isInteger(port)||port<1||port>65535)throw Error('PORT must be from 1 to 65535');
const api=import('../server/intelligence.mjs'),covenantApi=import('../server/covenant.mjs');
const sessionApi=import('../server/session.mjs'),controlsApi=import('../server/controls.mjs'),voiceApi=import('../server/voice.mjs');
const directorApi=import('../server/director.mjs');
const server=http.createServer(async(req,res)=>{
 try{const u=new URL(req.url,'http://localhost:'+port);
  if(u.pathname.startsWith('/api/')){
   const body=['GET','HEAD'].includes(req.method)?undefined:Readable.toWeb(req);
   const request=new Request(u,{method:req.method,headers:req.headers,body,...(body?{duplex:'half'}:{})});
   let response;
   if(u.pathname==='/api/intelligence')response=await(await api).handle(request);
   else if(u.pathname==='/api/director')response=await(await directorApi).handle(request);
   else if(u.pathname==='/api/director/sign')response=await(await directorApi).control(request,'sign');
   else if(u.pathname==='/api/director/cancel')response=await(await directorApi).control(request,'cancel');
   else if(u.pathname==='/api/covenant')response=await(await covenantApi).handle(request);
   else if(u.pathname==='/api/session')response=await(await sessionApi).handle(request);
   else if(u.pathname==='/api/covenant/sign')response=await(await controlsApi).handle(request,'sign');
   else if(u.pathname==='/api/covenant/cancel')response=await(await controlsApi).handle(request,'cancel');
   else if(u.pathname==='/api/voice/start')response=await(await voiceApi).start(request,{defer:p=>p});
   else if(u.pathname==='/api/voice/stop')response=await(await voiceApi).stop(request);
   else {res.writeHead(404);res.end('Not found');return;}
   res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));return;
  }
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end('Method not allowed');return;}
  const part=decodeURIComponent(u.pathname);const file=path.resolve(root,'.'+part+(part.endsWith('/')?'index.html':''));
  if(!file.startsWith(root+path.sep)||part.split('/').some(x=>x.startsWith('.'))){res.writeHead(404);res.end('Not found');return;}
  fs.readFile(file,(error,data)=>{if(error){res.writeHead(404);res.end('Not found');return;}res.writeHead(200,{'Content-Type':file.endsWith('.html')?'text/html; charset=utf-8':'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:data);});
 }catch{res.writeHead(400);res.end('Bad request');}
});
server.on('error',e=>{console.error(e.message);process.exitCode=1;});server.listen(port,host,()=>{console.log('COVENANT ASCENT: http://127.0.0.1:'+port);if(lan){console.log('Use a trusted network only; stop with Ctrl+C.');for(const list of Object.values(require('node:os').networkInterfaces()))for(const i of list||[])if(i.family==='IPv4'&&!i.internal)console.log('Phone: http://'+i.address+':'+port+'/');}});
