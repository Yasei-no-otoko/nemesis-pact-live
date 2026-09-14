"""Stalled voice-response fixture with native browser audio tracks and WebRTC cleanup."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json, time, os

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/validation-current/voice-body-timeout'
OUT.mkdir(parents=True, exist_ok=True)
BASE = os.environ.get('NEMESIS_TEST_URL', 'http://127.0.0.1:8080/')
FIXTURE = r"""
(()=>{
 const realFetch=window.fetch.bind(window),NativePC=window.RTCPeerConnection;
 window.voiceBodyFixture={calls:[],tracks:[],peers:[],bodyEntered:0,aborted:false};const fixture=window.voiceBodyFixture;
 window.RTCPeerConnection=new Proxy(NativePC,{construct(Type,args){const pc=new Type(...args);fixture.peers.push(pc);return pc;}});
 Object.defineProperty(navigator.mediaDevices,'getUserMedia',{value:async()=>{
  const context=new AudioContext(),destination=context.createMediaStreamDestination();fixture.audioContext=context;
  fixture.tracks.push(...destination.stream.getTracks());return destination.stream;
 }});
 window.fetch=async(input,options={})=>{
  const path=typeof input==='string'?input:new URL(input.url).pathname;
  if(!path.startsWith('/api/'))return realFetch(input,options);
  fixture.calls.push(path);
  if(path==='/api/session')return new Response(JSON.stringify({sessionId:'fixture-session',csrf:'fixture-csrf',expiresAt:Date.now()+60000,voiceEnabled:true,contractEnabled:true}));
  if(path==='/api/voice/start'){
   options.signal.addEventListener('abort',()=>{fixture.aborted=true;});
   return {ok:true,status:200,json:()=>{fixture.bodyEntered=performance.now();return new Promise(resolve=>fixture.release=()=>resolve({sessionId:'late-fixture-session',sdp:'unused-after-timeout',maxDurationMs:45000}));}};
  }
  if(path==='/api/voice/stop')return new Response(JSON.stringify({stopped:true}));
  if(path==='/api/covenant/cancel')return new Response(JSON.stringify({cancelled:true}));
  return new Response('{}',{status:503});
 };
})();
"""
with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path=r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',headless=True)
    page=browser.new_page(viewport={'width':1280,'height':800});page.add_init_script(FIXTURE)
    errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
    report={'checkedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'browser':browser.version,'base':BASE,'mode':'fixture response only; native silent audio MediaStream and RTCPeerConnection','realMicrophone':False,'realModelCalls':0,'controlledTime':False}
    try:
        page.goto(BASE,wait_until='networkidle');page.click('#first-contact');page.click('#cv-open-connection');page.check('#cv-consent');page.click('#cv-connection-done')
        page.wait_for_function('()=>!document.querySelector("#cv-voice-start").disabled');page.click('#cv-voice-start')
        page.wait_for_function('()=>voiceBodyFixture.bodyEntered>0')
        page.wait_for_function('()=>document.querySelector("#cv-voice-state").textContent.includes("ERROR")',timeout=22000)
        evidence=page.evaluate('''()=>({elapsedMs:performance.now()-voiceBodyFixture.bodyEntered,aborted:voiceBodyFixture.aborted,tracks:voiceBodyFixture.tracks.map(t=>t.readyState),peers:voiceBodyFixture.peers.map(p=>p.connectionState),voice:document.querySelector('#cv-voice-state').textContent})''')
        assert 14500<=evidence['elapsedMs']<21000 and evidence['aborted']
        assert evidence['tracks']==['ended'] and evidence['peers']==['closed']
        page.evaluate('()=>voiceBodyFixture.release()')
        page.wait_for_function('()=>voiceBodyFixture.calls.includes("/api/voice/stop")')
        assert 'ERROR' in page.inner_text('#cv-voice-state')
        page.click('#cv-propose');page.wait_for_function('()=>!document.querySelector("#cv-sign").disabled')
        assert 'LOCAL RULES' in page.inner_text('#cv-provider')
        page.screenshot(path=str(OUT/'timeout-local-fallback.png'))
        page.click('#cv-sign');page.wait_for_function('()=>JSON.parse(render_game_to_text()).phase==="combat"')
        assert json.loads(page.evaluate('()=>render_game_to_text()'))['liveVoice']['status']=='not-used'
        assert not errors
        report.update({'passed':True,'cleanup':evidence,'lateSessionHangup':True,'localFallbackSigned':True,'calls':page.evaluate('()=>voiceBodyFixture.calls')})
    except Exception as error:
        report.update({'passed':False,'error':str(error)});page.screenshot(path=str(OUT/'failure.png'))
    finally:
        report['pageErrors']=errors;(OUT/'result.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report));browser.close()
    if not report['passed']:raise SystemExit(1)
