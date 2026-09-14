"""Paid regression for the recorded clause-withdrawal failure: one Live session.
Windows Japanese TTS is input; production GPT-Live/Luna and Sign/combat are real.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_env import launch_kwargs
import ast,base64,hashlib,json,os,time
if os.environ.get('NEMESIS_ALLOW_LIVE_CLAUSE')!='1':
 raise SystemExit('Set NEMESIS_ALLOW_LIVE_CLAUSE=1; one $0.05 voice reservation and bounded text proposals.')
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/validation-current/voice-withdrawal/production-live';OUT.mkdir(parents=True,exist_ok=True)
URL='https://nemesis-pact-live.vercel.app'
# Reuse only the literal native-media fixture, never execute another paid test.
module=ast.parse((ROOT/'tests/production_voice_luna.py').read_text(encoding='utf8'))
SCRIPT=next(ast.literal_eval(n.value) for n in module.body if isinstance(n,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='SCRIPT' for t in n.targets))
SCRIPT=SCRIPT.replace('probe.sent.push({type:e.type,at:performance.now()})','probe.sent.push({type:e.type,at:performance.now(),sessionWide:e.delegation_id===null})')
fixture=ROOT/'.work/voice-clause-withdrawal.wav'
def state(p):return json.loads(p.evaluate('render_game_to_text()'))
with sync_playwright() as pw:
 b=pw.chromium.launch(**launch_kwargs(),args=['--autoplay-policy=no-user-gesture-required']);c=b.new_context(viewport={'width':1280,'height':800});p=c.new_page();p.set_default_timeout(22000);p.add_init_script(SCRIPT)
 calls=[];errors=[];ids=[]
 def response(r):
  if not r.url.startswith(URL+'/api/'):return
  x={'path':r.url[len(URL):],'status':r.status}
  try:
   v=r.json();x.update({k:v[k] for k in ('model','provider','modelIssue','modelFormat','spec','signed','revision','stopped','uncertain','latencyMs','accountedMicrodollars','error') if k in v})
   if x['path']=='/api/voice/start' and v.get('sessionId'):
    ids.append(v['sessionId']);(ROOT/'.work/voice-clause-session-ids.json').write_text(json.dumps(ids),encoding='utf8')
  except Exception:pass
  calls.append(x)
 p.on('response',response);p.on('pageerror',lambda e:errors.append(str(e)))
 report={'checkedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'url':URL,'browser':b.version,
  'input':'Microsoft Haruka Desktop TTS of the recorded phrase; no new human microphone',
  'utterance':'安全は撤回。その代わり敵の弾を遅く。','realApi':True,'controlledTime':False,'humanMicrophone':False,
  'fixtureSha256':hashlib.sha256(fixture.read_bytes()).hexdigest()}
 try:
  p.goto(URL,wait_until='networkidle');p.click('#first-contact');p.click('#cv-open-connection');p.check('#cv-consent');p.click('#cv-connection-done')
  p.fill('#cv-prompt','右側を安全にして。増援は許可する。');p.click('#cv-propose');p.wait_for_function('()=>!document.querySelector("#cv-sign").disabled')
  assert state(p)['proposal']['provider']=='openai' and state(p)['proposal']['spec']['zone']=='right'
  p.click('#cv-sign');p.wait_for_function('()=>JSON.parse(render_game_to_text()).seconds>=8.2');p.click('#cv-parley');before=state(p)
  p.wait_for_function('()=>!document.querySelector("#cv-voice-start").disabled');start=time.monotonic();p.click('#cv-voice-start')
  p.wait_for_function('()=>probe.events.some(e=>e.type==="session.started")');report['connectionMs']=round((time.monotonic()-start)*1000)
  report['fixture']=p.evaluate('playFixture',base64.b64encode(fixture.read_bytes()).decode())
  p.wait_for_function('''()=>{const s=JSON.parse(render_game_to_text());return probe.fixtureEnded && s.proposal?.provider==='openai'
    && s.proposal.spec.zone==='none' && s.proposal.spec.speed==='slow' && !document.querySelector('#cv-sign').disabled;}''',timeout=30000)
  offered=state(p);report['heard']=p.inner_text('#cv-caption-player');assert '撤回' in report['heard']
  assert p.input_value('#cv-prompt')==report['heard'] and 'Proposal withdrawn' not in p.inner_text('#cv-status')
  assert offered['revision']==1 and offered['seconds']==before['seconds'] and offered['player']['hp']==before['player']['hp'] and offered['enemies']==before['enemies']
  p.wait_for_function('()=>probe.sent.some(e=>e.type==="session.commentary.append")')
  p.screenshot(path=str(OUT/'01-clause-amendment-openai.png'));p.click('#cv-sign');p.wait_for_function('()=>JSON.parse(render_game_to_text()).revision===2');after=state(p)
  assert after['spec']==offered['proposal']['spec'] and after['player']['hp']==before['player']['hp'] and before['seconds']<=after['seconds']<before['seconds']+.5
  assert [e['hp'] for e in after['enemies'] if e['type']=='boss']==[e['hp'] for e in before['enemies'] if e['type']=='boss']
  p.screenshot(path=str(OUT/'02-signed-amendment.png'));report.update(passed=True,before=before,offer=offered['proposal'],after=after)
 except Exception as e:
  report.update(passed=False,error=str(e));p.screenshot(path=str(OUT/'failure.png'))
  try:report['failureState']=state(p);report['heard']=p.inner_text('#cv-caption-player')
  except Exception:pass
 finally:
  try:
   if p.locator('#cv-voice-stop').is_enabled():p.click('#cv-voice-stop')
   p.wait_for_function('()=>probe.tracks.every(t=>t.readyState==="ended") && probe.peers.every(p=>p.connectionState==="closed")',timeout=16000)
   report['tracks']=p.evaluate('probe.tracks.map(t=>t.readyState)');report['peers']=p.evaluate('probe.peers.map(p=>p.connectionState)');report['events']=p.evaluate('probe.events');report['sent']=p.evaluate('probe.sent')
   p.evaluate('Promise.all(probe.contexts.map(c=>c.close()))')
  except Exception as e:report['cleanupError']=str(e);report['passed']=False
  starts=[x for x in calls if x['path']=='/api/voice/start'];stops=[x for x in calls if x['path']=='/api/voice/stop'];proposals=[x for x in calls if x['path']=='/api/covenant'];signs=[x for x in calls if x['path']=='/api/covenant/sign']
  report['passed']=bool(report.get('passed') and not errors and len(starts)==1 and starts[0].get('model')=='gpt-live-1' and all(x.get('model')=='gpt-5.6-luna' and x.get('provider')=='openai' for x in proposals) and [x.get('revision') for x in signs]==[1,2] and len(stops)==1 and stops[0].get('stopped') is True and stops[0].get('uncertain') is False)
  report.update(api=calls,pageErrors=errors,realModelCalls=len(proposals),accountedMicrodollars={'openai':sum(x.get('accountedMicrodollars',0) for x in stops),'gateway':sum(x.get('accountedMicrodollars',0) for x in proposals)})
  (OUT/'result.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8');c.close();b.close()
 print(json.dumps({k:report[k] for k in ('passed','error','connectionMs','realModelCalls','accountedMicrodollars') if k in report}))
 if not report['passed']:raise SystemExit(1)
