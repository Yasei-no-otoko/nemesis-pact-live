"""One bounded production probe: server watchdog termination only.
Synthetic silent MediaStream; this is not human voice or negotiation evidence."""
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_env import launch_kwargs
import json, time

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/validation-current/production-watchdog'; OUT.mkdir(parents=True, exist_ok=True)
URL = 'https://nemesis-pact-live.vercel.app'

with sync_playwright() as pw:
    browser = pw.chromium.launch(**launch_kwargs(), args=['--autoplay-policy=no-user-gesture-required','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    context = browser.new_context(viewport={'width': 1280, 'height': 800})
    page = context.new_page(); page.set_default_timeout(16000)
    calls=[]; errors=[]; ids=[]
    page.on('pageerror', lambda e: errors.append(str(e)))
    def response(r):
        if '/api/' not in r.url: return
        item={'path':r.url.split(URL)[-1], 'status':r.status}
        try:
            body=r.json()
            for key in ('model','provider','error','stopped','uncertain','accountedMicrodollars'):
                if key in body: item[key]=body[key]
            if item['path']=='/api/voice/start' and body.get('sessionId'): ids.append(body['sessionId'])
        except Exception: pass
        calls.append(item)
    page.on('response', response)
    page.add_init_script('''(()=>{window.probe={events:[],tracks:[],stopCalls:[]};const NativePC=RTCPeerConnection;window.RTCPeerConnection=class extends NativePC{constructor(...a){super(...a);window.probe.pc=this;this.addEventListener('track',e=>{for(const t of e.streams?.[0]?.getTracks?.()||[]){window.probe.tracks.push(t);t.addEventListener('ended',()=>window.probe.events.push({type:'track.ended',at:performance.now()}));}});}createDataChannel(...a){const dc=super.createDataChannel(...a);dc.addEventListener('message',e=>{try{const x=JSON.parse(e.data);if(['session.started','session.closed','session.usage.updated'].includes(x.type))window.probe.events.push({type:x.type,at:performance.now(),usage:x.usage,reason:x.reason});}catch{}});return dc;}};navigator.mediaDevices.getUserMedia=async()=>{const ac=new AudioContext();await ac.resume();const d=ac.createMediaStreamDestination();window.probe.silent=true;window.probe.tracks.push(...d.stream.getTracks());return d.stream;};})()''')
    report={'url':URL,'browser':browser.version,'input':'Synthetic silent MediaStream; no human microphone','realApi':True,'humanLiveVerified':False,'utc':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())}
    try:
        page.goto(URL, wait_until='networkidle')
        page.click('#first-contact'); page.click('#cv-open-connection');page.check('#cv-consent');page.click('#cv-connection-done')
        page.wait_for_function('()=>!document.querySelector("#cv-voice-start").disabled')
        # Disable only browser stop/timer. The server watchdog remains untouched.
        page.evaluate('''()=>{const P=PactVoice.PactVoice.prototype;const old=P.stop;P.stop=function(reason){window.probe.stopCalls.push({reason,at:performance.now()});return Promise.resolve(false);};window.probe.oldStop=old;}''')
        started=time.monotonic(); page.click('#cv-voice-start')
        page.wait_for_function('()=>window.probe.events.some(e=>e.type==="session.started")')
        report['sessionStartedMs']=round((time.monotonic()-started)*1000)
        # Wait for the server watchdog (45s) with a hard 60s bound.
        page.wait_for_function('()=>window.probe.events.some(e=>e.type==="session.closed")', timeout=60000)
        report['watchdogObserved']=True
    except Exception as exc:
        report['watchdogObserved']=False; report['failure']=str(exc)
    finally:
        try:
            if not report.get('watchdogObserved'):
                page.evaluate('''()=>{if(window.probe?.oldStop){PactVoice.PactVoice.prototype.stop=window.probe.oldStop;}}''')
                if page.locator('#cv-voice-stop').is_enabled(): page.click('#cv-voice-stop')
                page.wait_for_timeout(1500)
            report['events']=page.evaluate('window.probe.events'); report['stopCalls']=page.evaluate('window.probe.stopCalls'); report['tracks']=page.evaluate('window.probe.tracks.map(t=>({kind:t.kind,state:t.readyState}))')
        except Exception: pass
        report['api']=calls; report['providerSessionIdsStoredOnly']=len(ids); report['pageErrors']=errors
        (OUT/'result.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
        # Keep provider IDs out of result.json and retain them only in ignored work material.
        (ROOT/'.work/voice-watchdog-session-ids.json').write_text(json.dumps(ids),encoding='utf-8')
        context.close(); browser.close()
    print(json.dumps(report,indent=2))
    if not report.get('watchdogObserved'): raise SystemExit(1)
