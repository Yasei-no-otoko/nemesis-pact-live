"""Explicit paid production integration, at most two Live sessions / sixteen proposals.

Synthetic Windows speech enters a native Web Audio MediaStream. Actual GPT-Live-1,
Luna, WebRTC events, application state, signing and combat are not mocked. This is
not human microphone evidence or submission footage. No browser clock override.
Generate fixtures with generate_voice_luna_fixtures.ps1. Opt in separately below.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_env import launch_kwargs
import base64, hashlib, json, os, subprocess, time

if os.environ.get('NEMESIS_ALLOW_LIVE_LUNA') != '1':
    raise SystemExit('Set NEMESIS_ALLOW_LIVE_LUNA=1; maximum reservations: OpenAI $0.10, Gateway $0.16.')
ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('NEMESIS_LIVE_LUNA_OUT', ROOT/'docs/validation-current/live-luna'))
OUT.mkdir(parents=True, exist_ok=True)
URL = 'https://nemesis-pact-live.vercel.app'
FIXTURES = ROOT/'.work/voice-luna-fixtures'
audio = {name: base64.b64encode((FIXTURES/(name+'.wav')).read_bytes()).decode()
         for name in ('left', 'correction', 'amendment')}
SCRIPT = r"""(()=>{
 const NativePC=RTCPeerConnection;
 window.probe={events:[],sent:[],tracks:[],peers:[],contexts:[],sources:[],analysers:[],inputs:[]};
 window.RTCPeerConnection=class extends NativePC{
  constructor(...a){super(...a);probe.peers.push(this);
   this.addEventListener('track',e=>{
    const ac=new AudioContext();probe.contexts.push(ac);ac.resume();
    const source=ac.createMediaStreamSource(e.streams[0]),analyser=ac.createAnalyser(),silent=ac.createGain();
    analyser.fftSize=1024;silent.gain.value=0;source.connect(analyser);analyser.connect(silent);silent.connect(ac.destination);probe.analysers.push(analyser);
   });
  }
  createDataChannel(...a){const dc=super.createDataChannel(...a),send=dc.send.bind(dc);
   dc.send=data=>{try{const e=JSON.parse(data);probe.sent.push({type:e.type,at:performance.now()});}catch{}return send(data);};
   dc.addEventListener('message',({data})=>{try{
    const e=JSON.parse(data),item={type:e.type,at:performance.now(),delta:e.delta,
      start_ms:e.start_ms,end_ms:e.end_ms,usage:e.usage,reason:e.reason,errorCode:e.error?.code};
    probe.events.push(item);
    if(e.type==='session.input_transcript.delta')setTimeout(()=>{
      const s=JSON.parse(render_game_to_text());probe.inputs.push({at:performance.now(),delta:e.delta,
        signDisabled:document.querySelector('#cv-sign').disabled,revision:s.revision});
    },0);
   }catch{}});return dc;
  }
 };
 navigator.mediaDevices.getUserMedia=async()=>{
   probe.audio=new AudioContext();probe.contexts.push(probe.audio);await probe.audio.resume();
   probe.destination=probe.audio.createMediaStreamDestination();
   probe.tracks.push(...probe.destination.stream.getTracks());return probe.destination.stream;
 };
 window.remoteLevel=()=>{const a=probe.analysers.at(-1);if(!a)return 0;
   const values=new Float32Array(a.fftSize);a.getFloatTimeDomainData(values);
   return Math.sqrt(values.reduce((s,v)=>s+v*v,0)/values.length);};
 window.playFixture=async data=>{
   const bytes=Uint8Array.from(atob(data),x=>x.charCodeAt(0));
   const buffer=await probe.audio.decodeAudioData(bytes.buffer);
   const source=probe.audio.createBufferSource();source.buffer=buffer;source.connect(probe.destination);
   probe.fixtureEnded=false;source.onended=()=>{probe.fixtureEnded=true;};probe.sources.push(source);
   source.start();return {at:performance.now(),durationSeconds:buffer.duration};
 };
})();"""

def state(page):
    return json.loads(page.evaluate('render_game_to_text()'))

with sync_playwright() as pw:
    browser = pw.chromium.launch(**launch_kwargs(), args=['--autoplay-policy=no-user-gesture-required'])
    context = browser.new_context(viewport={'width':1280, 'height':800})
    page = context.new_page(); page.set_default_timeout(20000); page.add_init_script(SCRIPT)
    calls, errors, private_ids = [], [], []
    def response(r):
        if not r.url.startswith(URL+'/api/'):
            return
        entry = {'path':r.url[len(URL):], 'status':r.status}
        try:
            body=r.json()
            entry.update({k:body[k] for k in ('provider','model','modelFormat','modelIssue','spec',
                'latencyMs','accountedMicrodollars','signed','revision','stopped','uncertain','error') if k in body})
            if entry['path']=='/api/voice/start' and body.get('sessionId'):
                private_ids.append(body['sessionId'])
                (ROOT/'.work/voice-luna-session-ids.json').write_text(json.dumps(private_ids), encoding='utf8')
        except Exception:
            pass
        calls.append(entry)
    page.on('response',response); page.on('pageerror',lambda e:errors.append(str(e)))
    release=json.loads((ROOT/'docs/RELEASE-CANDIDATE.json').read_text(encoding='utf8'))
    report = {'checkedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'url':URL,
        'verificationCheckoutCommit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip(),
        'productionSourceCommit':release['sourceCommit'],'deploymentId':release['deploymentId'],
        'browser':browser.version,'viewport':[1280,800],'os':'Windows 11','operation':'automated native Edge',
        'input':'Windows Microsoft Zira Desktop TTS through Web Audio MediaStream',
        'humanMicrophone':False,'controlledTime':False,'realApi':True,
        'maximumLiveSessions':2,'maximumGatewayProposals':16,
        'maximumReservationUsd':{'openai':.10,'gateway':.16},'connectionMs':[],'utterances':{},
        'fixtureSha256':{name:hashlib.sha256((FIXTURES/(name+'.wav')).read_bytes()).hexdigest() for name in audio}}
    def begin_voice(number):
        page.wait_for_function('()=>!document.querySelector("#cv-voice-start").disabled')
        began=time.monotonic(); page.click('#cv-voice-start')
        page.wait_for_function('(n)=>probe.events.filter(e=>e.type==="session.started").length===n',arg=number)
        report['connectionMs'].append(round((time.monotonic()-began)*1000))
    def speak(name):
        report['utterances'][name]=page.evaluate('playFixture',audio[name])
    def wait_proposal(zone):
        page.wait_for_function('''zone=>{const s=JSON.parse(render_game_to_text());
          return probe.fixtureEnded && s.proposal?.provider==='openai' && s.proposal.spec.zone===zone
            && !document.querySelector('#cv-sign').disabled;}''',arg=zone,timeout=30000)
        return state(page)
    try:
        page.goto(URL,wait_until='networkidle'); page.click('#first-contact')
        page.click('#cv-open-connection'); page.check('#cv-consent'); page.click('#cv-connection-done')
        begin_voice(1); speak('left')
        # Finish our first utterance, then interrupt the first actual reply. The
        # application may still be awaiting an unsigned left contract at this point.
        page.wait_for_function('''()=>probe.fixtureEnded && remoteLevel()>.005 &&
          performance.now()-(probe.events.filter(e=>e.type==='session.output_transcript.delta').at(-1)?.at||0)<1000''')
        report['beforeCorrection']=state(page)
        report['interruption']=page.evaluate('''()=>({at:performance.now(),remoteRms:remoteLevel(),
          lastOutput:probe.events.filter(e=>e.type==='session.output_transcript.delta').at(-1),
          firstFixtureEnded:probe.fixtureEnded,voiceState:document.querySelector('#cv-voice-state').textContent})''')
        speak('correction'); report['rightUnsigned']=wait_proposal('right')
        assert report['rightUnsigned']['revision']==0 and report['rightUnsigned']['spec'] is None
        assert any(c.get('model')=='gpt-5.6-luna' for c in calls if c['path']=='/api/covenant')
        page.screenshot(path=str(OUT/'01-corrected-voice-contract.png'))
        page.click('#cv-sign'); page.wait_for_function('()=>JSON.parse(render_game_to_text()).revision===1')
        page.wait_for_function('()=>JSON.parse(render_game_to_text()).seconds>=8.2')
        report['rightCombat']=state(page); assert report['rightCombat']['spec']['zone']=='right'
        page.screenshot(path=str(OUT/'02-right-combat.png'))
        page.click('#cv-parley'); page.wait_for_function('()=>JSON.parse(render_game_to_text()).phase==="parley"')
        report['beforeAmendment']=state(page); begin_voice(2); speak('amendment')
        report['amendmentUnsigned']=wait_proposal('none')
        spec=report['amendmentUnsigned']['proposal']['spec']
        assert spec['speed']=='slow' and spec['reflection']=='charged', 'Requested amendment benefits differ'
        # "can be weaker" permits that price; it is not an exclusive command.
        # Reinforcements were also explicitly accepted. Review the actual visible
        # counteroffer and report any difference before the test clicks Sign.
        assert spec['price'] in ('weaker_gun','reinforcements'), 'Price was not one of the permitted tradeoffs'
        report['paymentReview']={'requested':'weaker_gun','offered':spec['price'],
            'preferredPaymentApplied':spec['price']=='weaker_gun',
            'operatorAcceptedDisplayedCounteroffer':True}
        before=report['beforeAmendment']; unsigned=report['amendmentUnsigned']
        assert unsigned['seconds']==before['seconds'] and unsigned['player']['hp']==before['player']['hp']
        assert unsigned['enemies']==before['enemies'] and unsigned['revision']==1
        page.screenshot(path=str(OUT/'03-amendment-voice-contract.png'))
        page.click('#cv-sign'); page.wait_for_function('()=>JSON.parse(render_game_to_text()).revision===2')
        after=state(page); report['afterAmendment']=after
        assert after['spec']==spec and after['player']['hp']==before['player']['hp']
        assert before['seconds']<=after['seconds']<before['seconds']+.5
        assert [e['hp'] for e in after['enemies'] if e['type']=='boss']==[e['hp'] for e in before['enemies'] if e['type']=='boss']
        page.screenshot(path=str(OUT/'04-amended-combat.png'))
        report['passed']=True
    except Exception as error:
        report.update(passed=False,error=str(error))
        try:
            report['failureState']=state(page);page.screenshot(path=str(OUT/'failure.png'))
        except Exception:
            pass
    finally:
        try:
            if page.locator('#cv-voice-stop').is_enabled():page.click('#cv-voice-stop')
            page.wait_for_function('()=>probe.tracks.every(t=>t.readyState==="ended") && probe.peers.every(p=>p.connectionState==="closed")',timeout=16000)
            report['events']=page.evaluate('probe.events');report['sent']=page.evaluate('probe.sent')
            report['inputSignObservations']=page.evaluate('probe.inputs')
            report['tracks']=page.evaluate('probe.tracks.map(t=>t.readyState)')
            report['peers']=page.evaluate('probe.peers.map(p=>p.connectionState)')
            page.evaluate('Promise.all(probe.contexts.map(c=>c.close()))')
        except Exception as error:
            report['cleanupError']=str(error);report['passed']=False
        report.update(api=calls,pageErrors=errors)
        proposals=[x for x in calls if x['path']=='/api/covenant']
        starts=[x for x in calls if x['path']=='/api/voice/start']
        stops=[x for x in calls if x['path']=='/api/voice/stop']
        signed=[x for x in calls if x['path']=='/api/covenant/sign']
        report['counts']={'liveStarts':len(starts),'proposals':len(proposals),'signs':len(signed),'confirmedStops':sum(x.get('stopped') is True for x in stops)}
        report['accountedMicrodollars']={'openai':sum(x.get('accountedMicrodollars',0) for x in stops),
            'gateway':sum(x.get('accountedMicrodollars',0) for x in proposals)}
        report['passed']=bool(report.get('passed') and not errors and len(starts)==2 and len(proposals)<=16
            and all(x.get('model')=='gpt-live-1' for x in starts)
            and all(x.get('provider')=='openai' and x.get('model')=='gpt-5.6-luna' for x in proposals)
            and [x.get('revision') for x in signed]==[1,2]
            and sum(x.get('stopped') is True and not x.get('uncertain') for x in stops)==2)
        (OUT/'result.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
        context.close(); browser.close()
    print(json.dumps({k:report[k] for k in ('passed','counts','connectionMs','accountedMicrodollars','error','cleanupError') if k in report}))
    if not report['passed']:raise SystemExit(1)
