"""Real GPT-Live + real contract model. Synthetic Windows TTS audio input.
This is protocol/integration evidence, NOT human microphone or demo evidence.
The app, WebRTC, server quotas, delegation, proposal and Sign are not mocked.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_env import launch_kwargs
import base64,json,time
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/validation-current/production-voice-synthetic';OUT.mkdir(parents=True,exist_ok=True)
URL='https://nemesis-pact-live.vercel.app'
with sync_playwright() as pw:
    b=pw.chromium.launch(**launch_kwargs(),args=['--autoplay-policy=no-user-gesture-required','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    c=b.new_context(viewport={'width':1280,'height':800});p=c.new_page();p.set_default_timeout(16000)
    errors=[];calls=[];private_ids=[]
    p.on('pageerror',lambda e:errors.append(str(e)))
    def response(r):
        if '/api/' not in r.url: return
        x={'path':r.url.split(URL)[-1],'status':r.status}
        try:
            v=r.json()
            x.update({k:v[k] for k in ['error','model','provider','latencyMs','billedBy','spec','signed','stopped','uncertain','accountedMicrodollars'] if k in v})
            if x['path']=='/api/voice/start' and 'sessionId' in v: private_ids.append(v['sessionId'])
        except Exception:pass
        calls.append(x)
    p.on('response',response)
    p.add_init_script('''(()=>{
      window.probe={events:[],sent:[],tracks:[],pcs:[],audio:null};
      const NativePC=RTCPeerConnection;
      window.RTCPeerConnection=class extends NativePC{
        constructor(...args){super(...args);probe.pcs.push(this);}
        createDataChannel(...args){const dc=super.createDataChannel(...args),send=dc.send.bind(dc);
          dc.send=data=>{try{const e=JSON.parse(data);probe.sent.push({type:e.type,at:performance.now()});}catch{}send(data);};
          dc.addEventListener('message',({data})=>{try{const e=JSON.parse(data);probe.events.push({type:e.type,at:performance.now(),delta:e.delta,delegation:e.delegation,delegation_id:e.delegation_id,usage:e.usage,reason:e.reason,error:e.error?{code:e.error.code,param:e.error.param,message:e.error.message}:undefined});}catch{}});return dc;}
      };
      navigator.mediaDevices.getUserMedia=async()=>{
        probe.audio=new AudioContext();await probe.audio.resume();probe.destination=probe.audio.createMediaStreamDestination();
        probe.tracks.push(...probe.destination.stream.getTracks());return probe.destination.stream;
      };
      window.playFixture=async data=>{const buffer=Uint8Array.from(atob(data),x=>x.charCodeAt(0));const audio=await probe.audio.decodeAudioData(buffer.buffer);const source=probe.audio.createBufferSource();source.buffer=audio;source.connect(probe.destination);probe.fixtureStarted=performance.now();probe.source?.stop();probe.source=source;source.start();return audio.duration;};
    })()''')
    report={'url':URL,'browser':b.version,'input':'Synthetic Windows System.Speech TTS through a Web Audio MediaStream; no human microphone','realApi':True,'humanLiveVerified':False,'utc':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())}
    try:
        p.goto(URL,wait_until='networkidle');p.evaluate('''()=>{const proto=PactVoice.PactVoice.prototype,old=proto._delegate;proto._delegate=function(id,event){probe.sent.push({type:'probe.delegate.enter',at:performance.now(),id});return old.call(this,id,event);};}''');p.click('#first-contact');p.click('#cv-open-connection');p.check('#cv-consent');p.click('#cv-connection-done')
        p.wait_for_function('()=>!document.querySelector("#cv-voice-start").disabled')
        start=time.monotonic();p.click('#cv-voice-start')
        p.wait_for_function('()=>probe.events.some(e=>e.type==="session.started")')
        report['connectionMs']=round((time.monotonic()-start)*1000)
        p.evaluate('playFixture',base64.b64encode((ROOT/'.work/voice-left.wav').read_bytes()).decode())
        p.wait_for_function('()=>probe.events.some(e=>e.type==="session.output_transcript.delta")',timeout=20000)
        report['interruptionAt']=p.evaluate('performance.now()')
        p.evaluate('playFixture',base64.b64encode((ROOT/'.work/voice-correction.wav').read_bytes()).decode())
        p.wait_for_function('()=>JSON.parse(render_game_to_text()).proposal?.provider==="openai" && JSON.parse(render_game_to_text()).proposal?.spec.zone==="right" && !document.querySelector("#cv-sign").disabled',timeout=23000)
        report['unsigned']=json.loads(p.evaluate('render_game_to_text()'))
        p.locator('#cv-proposal').scroll_into_view_if_needed();p.screenshot(path=str(OUT/'01-corrected-proposal.png'))
        p.click('#cv-sign');p.wait_for_function('()=>JSON.parse(render_game_to_text()).revision===1')
        p.wait_for_timeout(1500);report['signed']=json.loads(p.evaluate('render_game_to_text()'))
        p.screenshot(path=str(OUT/'02-signed-combat.png'));report['success']=True
    except Exception as e:
        report['success']=False;report['failure']=str(e);report['status']=p.locator('#cv-status').inner_text();report['voiceState']=p.locator('#cv-voice-state').inner_text();p.screenshot(path=str(OUT/'failure.png'))
    finally:
        try:
            if p.locator('#cv-voice-stop').is_enabled():p.click('#cv-voice-stop')
            p.wait_for_timeout(1800)
            report['events']=p.evaluate('probe.events');report['sent']=p.evaluate('probe.sent');report['tracks']=p.evaluate('probe.tracks.map(t=>({kind:t.kind,state:t.readyState}))');report['peerStates']=p.evaluate('probe.pcs.map(p=>p.connectionState)')
        except Exception:pass
        report['api']=calls;report['pageErrors']=errors
        (OUT/'result.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
        (ROOT/'.work/voice-probe-session-ids.json').write_text(json.dumps(private_ids),encoding='utf-8')
        print(json.dumps(report,indent=2));c.close();b.close()
    if not report['success']:raise SystemExit(1)
