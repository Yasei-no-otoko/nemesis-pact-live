"""Production rendering sample with ordinary local-rule play; no mocks or AI calls."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json,time,os
ROOT=Path(__file__).resolve().parents[1];OUT=Path(os.environ.get('NEMESIS_RENDER_OUT',ROOT/'docs/validation-current/hardware-render'));OUT.mkdir(parents=True,exist_ok=True)
BASE=os.environ.get('NEMESIS_TEST_URL','https://nemesis-pact-live.vercel.app').rstrip('/')
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path=r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',headless=True)
 cases=[]
 for name,url,viewport,mobile in [('webgl2-desktop',BASE+'/?renderer=webgl2',{'width':1280,'height':800},False),('auto-desktop',BASE+'/',{'width':1280,'height':800},False),('auto-portrait',BASE+'/',{'width':390,'height':844},True)]:
  context=b.new_context(viewport=viewport,has_touch=mobile,is_mobile=mobile);p=context.new_page();errors=[];api=[];p.on('pageerror',lambda e:errors.append(str(e)));p.on('request',lambda r:api.append(r.url) if '/api/' in r.url else None)
  began=time.monotonic();p.goto(url,wait_until='networkidle');p.wait_for_function('()=>NEMESIS_RENDERER.stats().frames>3');startup=round((time.monotonic()-began)*1000)
  p.click('#first-contact');p.click('#cv-open-connection');p.select_option('#cv-mode','local');p.click('#cv-use-local');p.click('#cv-propose');p.wait_for_function('!document.querySelector("#cv-sign").disabled');p.click('#cv-sign');p.wait_for_function('()=>JSON.parse(render_game_to_text()).phase==="combat"')
  if not mobile:
   p.keyboard.down('ArrowLeft');p.keyboard.down('ArrowUp');p.wait_for_timeout(350);p.keyboard.up('ArrowUp');p.wait_for_timeout(400);p.keyboard.up('ArrowLeft')
  info=p.evaluate('''async()=>{const r=NEMESIS_RENDERER,a=r.active;let adapter=null;const gl=r.fallback?.gl;if(gl){const ex=gl.getExtension('WEBGL_debug_renderer_info');if(ex)adapter={vendor:gl.getParameter(ex.UNMASKED_VENDOR_WEBGL),renderer:gl.getParameter(ex.UNMASKED_RENDERER_WEBGL)};}let webgpu=null;if(a.adapter?.info){const v=a.adapter.info;webgpu={vendor:v.vendor,architecture:v.architecture,device:v.device,description:v.description};}return {stats:r.stats(),glAdapter:adapter,webgpuAdapter:webgpu,userAgent:navigator.userAgent,dpr:devicePixelRatio};}''')
  sample=p.evaluate('''()=>new Promise(resolve=>{const dt=[],start=performance.now(),firstFrames=NEMESIS_RENDERER.stats().frames;let prev=start;function frame(t){dt.push(t-prev);prev=t;if(t-start<10000){requestAnimationFrame(frame);return;}resolve({elapsedMs:t-start,frameIntervalsMs:dt,rendererFrames:NEMESIS_RENDERER.stats().frames-firstFrames,endState:JSON.parse(render_game_to_text()),renderer:NEMESIS_RENDERER.stats()});}requestAnimationFrame(frame);})''')
  intervals=sample.pop('frameIntervalsMs');sample.update({'rafSamples':len(intervals),'rafMeanMs':sum(intervals)/len(intervals),'rafMaxMs':max(intervals),'rafMedianMs':sorted(intervals)[len(intervals)//2],'renderFps':sample['rendererFrames']/(sample['elapsedMs']/1000)})
  p.screenshot(path=str(OUT/(name+'.png')))
  cases.append({'name':name,'url':url,'viewport':viewport,'mobileEmulation':mobile,'headless':True,'startupMs':startup,'rendererInfo':info,'sample':sample,'errors':errors,'apiRequests':api});context.close()
 report={'checkedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'browser':b.version,'physicalHost':'Windows / AMD Radeon RX 6900 XT (CIM driver 32.0.21045.5002)','method':'automated ordinary LOCAL RULES controls; actual browser rendering; 10-second rAF samples; no real phones, no synthetic time, no model calls; rAF is frame cadence, not GPU timestamp query','cases':cases};assert all(not c['errors'] and not c['apiRequests'] and c['sample']['endState']['build']=='1.0.0' for c in cases),cases;(OUT/'result.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps({'browser':report['browser'],'samples':[{'case':c['name'],'backend':c['sample']['renderer']['backend'],'fps':c['sample']['renderFps'],'adapter':c['rendererInfo']['glAdapter'],'errors':c['errors'],'apiRequests':len(c['apiRequests'])} for c in cases]},indent=2));b.close()
