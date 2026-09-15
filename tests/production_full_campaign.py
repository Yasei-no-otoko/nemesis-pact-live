"""Actual production full campaign capture. Fixed autoplay, synthetic player speech, real Live/Luna.
No mutable test hooks, no clock overrides, no mocked model responses. Explicit bounded paid opt-in.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_env import launch_kwargs
import ast,base64,hashlib,json,os,subprocess,time
if os.environ.get('NEMESIS_ALLOW_FULL_CAMPAIGN')!='1':raise SystemExit('Opt in: NEMESIS_ALLOW_FULL_CAMPAIGN=1. At most6 Live calls ($0.30) and42 Luna calls ($0.42 reservations).')
ROOT=Path(__file__).resolve().parents[1];URL='https://nemesis-pact-live.vercel.app';OUT=ROOT/'docs/validation-adaptive/full-campaign';OUT.mkdir(parents=True,exist_ok=True)
ART=ROOT/'.artifacts/submission';ART.mkdir(parents=True,exist_ok=True);VIDEO=ART/'NEMESIS-PACT-v1.3.0-full-campaign-original.webm'
parsed=ast.parse((ROOT/'tests/production_voice_luna.py').read_text(encoding='utf-8'));SCRIPT=next(ast.literal_eval(n.value) for n in parsed.body if isinstance(n,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='SCRIPT' for t in n.targets));SCRIPT=SCRIPT.replace("document.querySelector('#cv-sign').disabled","document.querySelector('#ai-apply').disabled")
FIX=ROOT/'.work/full-campaign-voice';audio={n:base64.b64encode((FIX/(n+'.wav')).read_bytes()).decode() for n in ['first','correction','mirror','sanctuary','duel']}
report={'checkedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'url':URL,'sourceCommit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip(),'voiceModel':'gpt-live-1','contractModel':'gpt-5.6-luna','adaptiveModel':'gpt-5.6-luna','humanMicrophone':False,'physicalPhone':False,'headless':True,'operation':'Native Edge WebGPU, ordinary requestAnimationFrame, fixed demo input policy','controlledTime':False,'mutatedGameState':False,'playerSpeech':'Original Microsoft Zira Desktop synthesis fed into a live Web Audio MediaStream','maxReservationsUsd':{'openai':.30,'gateway':.42},'fixtureSha256':{n:hashlib.sha256((FIX/(n+'.wav')).read_bytes()).hexdigest() for n in audio},'marks':[],'negotiations':[]}
with sync_playwright() as pw:
 browser=pw.chromium.launch(**launch_kwargs(headless=True),args=['--auto-accept-this-tab-capture','--autoplay-policy=no-user-gesture-required'])
 context=browser.new_context(viewport={'width':1920,'height':1080},accept_downloads=True);page=context.new_page();page.set_default_timeout(22000);page.add_init_script(SCRIPT)
 admitted={'voice':0,'pact':0,'analysis':0};limits={'voice':6,'pact':24,'analysis':18};calls=[];errors=[];ids=[];failed=[]
 def admission(route):
  r=route.request;body=r.post_data_json or {};kind='voice' if r.url.endswith('/voice/start') else 'analysis' if r.url.endswith('/adaptive') else 'pact' if body.get('action')=='propose' else None
  if kind:
   admitted[kind]+=1
   if admitted[kind]>limits[kind]:route.fulfill(status=429,json={'error':'CAPTURE_ALLOWANCE_REACHED'});return
  route.continue_()
 for path in ['voice/start','campaign','adaptive']:page.route('**/api/'+path,admission)
 def response(r):
  if not r.url.startswith(URL+'/api/'):return
  item={'path':r.url[len(URL):],'status':r.status,'wall':time.time()}
  try:
   body=r.json();item.update({k:body[k] for k in ['provider','model','decision','applied','latencyMs','accountedMicrodollars','signed','stopped','uncertain','error','sequence','deduplicated'] if k in body})
   if 'applied' in item:item['applied'].pop('runId',None)
   if r.url.endswith('/campaign'):item['action']=r.request.post_data_json['action']
   if r.url.endswith('/voice/start') and body.get('sessionId'):
    ids.append(body['sessionId']);(ROOT/'.work/full-campaign-voice-ids.json').write_text(json.dumps(ids),encoding='utf-8')
  except Exception:pass
  calls.append(item)
 page.on('response',response);page.on('pageerror',lambda e:errors.append(str(e)));page.on('requestfailed',lambda r:failed.append({'path':r.url.split(URL)[-1],'failure':r.failure}))
 def state():return json.loads(page.evaluate('render_game_to_text()'))
 def mark(label,s=None):
  s=s or state();x={'label':label,'captureSeconds':page.evaluate('(Date.now()-NemesisDemo.startedAt)/1000'),'screen':s.get('screen'),'stage':s.get('stage'),'wave':s.get('wave'),'combatSeconds':s.get('seconds'),'bosses':s.get('bossKills'),'hp':(s.get('player') or {}).get('hp'),'level':(s.get('adaptive') or {}).get('level')};report['marks'].append(x);print(json.dumps(x),flush=True);return x
 def speak(name):return page.evaluate('playFixture',audio[name])
 def negotiate(stage):
  expected=['mirror','sanctuary','mirror','duel','mirror','mirror'][stage];entry={'stage':stage,'expected':expected};entry['began']=mark('voice-negotiation')
  page.check('#ai-consent');page.wait_for_function('()=>!document.querySelector("#campaign-voice-start").disabled');before=page.evaluate('probe.events.filter(e=>e.type==="session.started").length');began=time.monotonic();page.click('#campaign-voice-start')
  page.wait_for_function('(n)=>probe.events.filter(e=>e.type==="session.started").length>n',arg=before);entry['connectionMs']=round((time.monotonic()-began)*1000)
  if stage==0:
   entry['first']=speak('first');page.wait_for_function('()=>probe.fixtureEnded && remoteLevel()>.005 && performance.now()-(probe.events.filter(e=>e.type==="session.output_transcript.delta").at(-1)?.at||0)<1000')
   entry['interruption']={'remoteRms':page.evaluate('remoteLevel()'),'mark':mark('interrupt-enemy')};entry['correction']=speak('correction')
  else:entry['utterance']=speak(expected)
  page.wait_for_function('(id)=>{const s=JSON.parse(render_game_to_text());return probe.fixtureEnded&&s.campaignProposal?.provider==="openai"&&s.campaignProposal.decision.contractId===id&&!document.querySelector("#ai-apply").disabled;}',arg=expected,timeout=30000)
  entry['unsigned']=state();entry['proposalMark']=mark('validated-spoken-pact');page.wait_for_timeout(1800)
  if stage in [0,5]:page.screenshot(path=str(OUT/f'voice-sector-{stage+1}.png'))
  entry['caption']=page.locator('#campaign-caption-rival').inner_text();page.click('#ai-apply');page.wait_for_function('()=>JSON.parse(render_game_to_text()).screen==="game"');entry['signed']=state();entry['signMark']=mark('signed-pact')
  assert entry['signed']['campaignPact']==expected and 'gpt-5.6-luna' in entry['signed']['campaignPactSource'];report['negotiations'].append(entry)
 recording=False
 try:
  page.goto(URL+'/?demo=1',wait_until='load');page.wait_for_function('()=>NEMESIS_RENDERER.stats().backend.includes("WEBGPU")');assert not page.evaluate('!!window.__PACT_TEST__')
  page.click('#start');page.click('#hangar-ready');page.check('#autoplay-enabled');page.check('#adaptive-enabled');page.check('#autoplay-pause-pacts');page.fill('#seed','STORY-AUTO-ASSIST-2');page.wait_for_timeout(2500)
  page.click('#demo-record');page.wait_for_function('()=>NemesisDemo.state==="recording"');recording=True
  report['captureSettings']=page.evaluate('()=>{const s=NemesisDemo.display.getVideoTracks()[0].getSettings();return {width:s.width,height:s.height,frameRate:s.frameRate,displaySurface:s.displaySurface};}');assert report['captureSettings']['displaySurface']=='browser';assert report['captureSettings']['frameRate']==60
  # Clearly disclose synthetic input on the actual captured page.
  page.evaluate("""()=>{const label=document.createElement('span');label.id='capture-disclosure';label.textContent='AUTOMATED DEMO / SYNTHETIC PLAYER SPEECH / REAL GPT-LIVE-1 + LUNA';Object.assign(label.style,{position:'fixed',top:'4px',left:'50%',transform:'translateX(-50%)',font:'11px sans-serif',color:'#b2ded0',background:'#061017e8',padding:'5px 10px',zIndex:'200',pointerEvents:'none'});document.body.append(label);}""")
  mark('recording-start');page.wait_for_timeout(1500);page.click('#launch');deadline=time.monotonic()+1200;seen=set();lastkey=None
  while time.monotonic()<deadline:
   s=state();key=(s.get('screen'),s.get('stage'),s.get('wave'),s.get('bossKills'),len((s.get('adaptive') or {}).get('history',[])))
   if key!=lastkey:
    mark('state',s);lastkey=key
    if s.get('screen')=='game' and s.get('wave')==2:page.screenshot(path=str(OUT/f'boss-{s["stage"]+1}.png'))
    if s.get('screen')=='adaptive-screen' and (s.get('adaptive') or {}).get('history') and s['stage'] in [0,2,5]:page.screenshot(path=str(OUT/f'analysis-{s["stage"]}-{s["wave"]}.png'))
   if s.get('phase')=='dead':raise AssertionError('Autopilot was defeated; preserve actual run.')
   if s.get('screen')=='ai-screen' and s['stage'] not in seen:seen.add(s['stage']);negotiate(s['stage']);lastkey=None
   if s.get('screen')=='result' and s.get('phase')=='won':report['victory']=s;mark('full-campaign-victory',s);break
   if errors:raise AssertionError(errors[0])
   page.wait_for_timeout(250)
  else:raise TimeoutError('Full campaign exceeded20minute recording allowance')
  r=report['victory']['runReport'];assert r['bosses']==6 and r['encounters']==18 and len(r['encounterResults'])==18 and len(report['negotiations'])==6
  assert len(r['adaptive']['history'])==18 and all(x['provider']=='openai' and x['model']=='gpt-5.6-luna' for x in r['adaptive']['history'])
  assert any(x['before']!=x['after'] for x in r['adaptive']['history']);assert page.evaluate('probe.tracks.every(t=>t.readyState==="ended")&&probe.peers.every(p=>p.connectionState==="closed")')
  assert page.evaluate('localStorage.getItem("nemesis.scores.v1")') is None
  page.screenshot(path=str(OUT/'victory.png'));page.wait_for_timeout(5000);report['success']=True
 except Exception as e:
  report['success']=False;report['failure']=str(e)
  try:page.screenshot(path=str(OUT/'failure.png'))
  except:pass
 finally:
  try:
   if page.is_visible('#campaign-voice-stop') and page.is_enabled('#campaign-voice-stop'):page.click('#campaign-voice-stop')
   page.wait_for_function('()=>probe.tracks.every(t=>t.readyState==="ended")&&probe.peers.every(p=>p.connectionState==="closed")',timeout=16000)
   report['tracks']=page.evaluate('probe.tracks.map(t=>t.readyState)');report['peers']=page.evaluate('probe.peers.map(p=>p.connectionState)');report['voiceEvents']=page.evaluate('probe.events');report['sentEvents']=page.evaluate('probe.sent')
  except Exception as e:report['cleanupError']=str(e)
  try:
   if recording and page.evaluate('NemesisDemo.state==="recording"'):
    report['captureEndSettings']=page.evaluate('()=>{const s=NemesisDemo.display.getVideoTracks()[0].getSettings();return {width:s.width,height:s.height,frameRate:s.frameRate,displaySurface:s.displaySurface};}')
    with page.expect_download(timeout=60000) as dl:page.click('#demo-record')
    dl.value.save_as(str(VIDEO));report['video']={'filename':VIDEO.name,'bytes':VIDEO.stat().st_size,'sha256':hashlib.sha256(VIDEO.read_bytes()).hexdigest()}
  except Exception as e:report['captureError']=str(e)
  report.update(api=calls,pageErrors=errors,failedRequests=failed,admitted=admitted,browser=browser.version)
  (OUT/'result.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps({k:report.get(k) for k in ['success','failure','captureError','cleanupError','admitted','pageErrors','video']},ensure_ascii=True),flush=True);context.close();browser.close()
if not report.get('success') or report.get('captureError') or report.get('cleanupError'):raise SystemExit(1)
