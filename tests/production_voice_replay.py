"""Explicit, bounded paid regression: three real Live sessions, silent native media.
Run only with NEMESIS_ALLOW_LIVE_REPLAY=1. This is not human speech evidence.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_env import launch_kwargs
import json, os, time

if os.environ.get('NEMESIS_ALLOW_LIVE_REPLAY') != '1':
    raise SystemExit('Explicit live replay opt-in required; reserves at most $0.15.')
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/validation-current/voice-replay'; OUT.mkdir(parents=True, exist_ok=True)
URL = 'https://nemesis-pact-live.vercel.app'
SCRIPT = r"""(()=>{
 const NativePC=RTCPeerConnection;window.replay={events:[],tracks:[],peers:[],contexts:[]};
 window.RTCPeerConnection=class extends NativePC{
  constructor(...a){super(...a);replay.peers.push(this);}
  createDataChannel(...a){const dc=super.createDataChannel(...a);dc.addEventListener('message',e=>{try{const v=JSON.parse(e.data);if(v.type==='session.started')replay.events.push({type:v.type,at:performance.now()});}catch{}});return dc;}
 };
 navigator.mediaDevices.getUserMedia=async()=>{const ac=new AudioContext();await ac.resume();const d=ac.createMediaStreamDestination();replay.contexts.push(ac);replay.tracks.push(...d.stream.getTracks());return d.stream;};
})();"""

with sync_playwright() as pw:
    browser=pw.chromium.launch(**launch_kwargs(), args=['--autoplay-policy=no-user-gesture-required'])
    context=browser.new_context(viewport={'width':1280,'height':800})
    page=context.new_page();page.set_default_timeout(22000);page.add_init_script(SCRIPT)
    calls=[];errors=[];private_ids=[];latencies=[]
    def response(r):
        if not r.url.startswith(URL+'/api/'): return
        item={'path':r.url[len(URL):], 'status':r.status}
        try:
            body=r.json()
            for key in ('model','error','stopped','uncertain'):
                if key in body:item[key]=body[key]
            if item['path']=='/api/voice/start' and body.get('sessionId'):private_ids.append(body['sessionId'])
        except Exception:pass
        calls.append(item)
    page.on('response',response);page.on('pageerror',lambda e:errors.append(str(e)))
    report={'checkedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'url':URL,'browser':browser.version,'os':'Windows 11','operation':'automated native Edge','input':'silent AudioContext MediaStream; no human microphone or speech','realApi':True,'humanNegotiationProof':False,'maximumPaidSessions':3,'maximumConservativeUsd':0.15}
    def start_stop(expected):
        page.wait_for_function('()=>!document.querySelector("#cv-voice-start").disabled')
        began=time.monotonic();page.click('#cv-voice-start')
        page.wait_for_function('(n)=>replay.events.length===n',arg=expected)
        latencies.append(round((time.monotonic()-began)*1000))
        page.click('#cv-voice-stop')
        page.wait_for_function('()=>document.querySelector("#cv-voice-state").textContent.includes("STOPPED")')
        assert all(t=='ended' for t in page.evaluate('replay.tracks.map(t=>t.readyState)'))
        assert sum(c['path']=='/api/voice/stop' and c.get('stopped') is True for c in calls)==expected
    try:
        page.goto(URL,wait_until='networkidle');page.click('#first-contact');page.click('#cv-open-connection');page.check('#cv-consent');page.click('#cv-connection-done')
        page.wait_for_function('()=>!document.querySelector("#cv-voice-start").disabled')
        original_cookies=context.cookies(URL)
        start_stop(1);start_stop(2)
        page.click('#cv-voice-start')
        page.wait_for_function('()=>document.querySelector("#cv-voice-state").textContent.includes("ERROR")')
        message=page.inner_text('#cv-status')
        assert 'Both voice negotiations for this fight are used' in message
        assert any(c.get('error')=='VOICE_QUOTA_voice_duration' for c in calls)
        assert all(t=='ended' for t in page.evaluate('replay.tracks.map(t=>t.readyState)'))
        page.screenshot(path=str(OUT/'per-fight-limit.png'))
        page.get_by_role('button',name='Main menu',exact=True).click()
        page.click('#first-contact');page.click('#cv-open-connection');page.check('#cv-consent');page.click('#cv-connection-done')
        start_stop(3)
        assert context.cookies(URL)==original_cookies, 'App authentication was reset'
        starts=[c for c in calls if c['path']=='/api/voice/start']
        assert [c['status'] for c in starts]==[200,200,429,200]
        assert all(c.get('model')=='gpt-live-1' for c in starts if c['status']==200)
        assert sum(c['path']=='/api/session' for c in calls)==1
        assert not errors
        page.screenshot(path=str(OUT/'new-fight-voice-stopped.png'))
        report.update({'passed':True,'sameCookie':True,'newPlayVoiceResumed':True,'sameFightLimitRetained':True,'limitMessage':message,'sessionStartedMs':latencies})
    except Exception as error:
        report.update({'passed':False,'error':str(error)})
        page.screenshot(path=str(OUT/'failure.png'))
    finally:
        try:
            if page.locator('#cv-voice-stop').is_enabled():page.click('#cv-voice-stop');page.wait_for_timeout(1500)
            report['tracks']=page.evaluate('replay.tracks.map(t=>t.readyState)')
            report['peers']=page.evaluate('replay.peers.map(p=>p.connectionState)')
            report['sessionStartedEvents']=page.evaluate('replay.events.length')
            report['renderer']=json.loads(page.evaluate('render_game_to_text()')).get('renderer')
            page.evaluate('Promise.all(replay.contexts.map(c=>c.close()))')
        except Exception:pass
        report['api']=calls;report['pageErrors']=errors
        (ROOT/'.work/voice-replay-session-ids.json').write_text(json.dumps(private_ids),encoding='utf-8')
        (OUT/'production.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
        context.close();browser.close()
    print(json.dumps(report,indent=2))
    if not report.get('passed'):raise SystemExit(1)
