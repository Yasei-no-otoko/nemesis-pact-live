"""Opt-in real GPT-Live-1 + Luna campaign integration. Automated speech, not a human microphone.
At most 1 Live connection and 8 generated pact proposals ($0.05 / $0.08 reservations).
Reuses the native media probe definition without executing the First Contact test.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_env import launch_kwargs
import ast,base64,json,os,time,hashlib
if os.environ.get('NEMESIS_ALLOW_CAMPAIGN_LIVE')!='1':raise SystemExit('Opt in with NEMESIS_ALLOW_CAMPAIGN_LIVE=1; OpenAI $0.05 / Gateway $0.08 maximum reservations.')
ROOT=Path(__file__).resolve().parents[1];URL='https://nemesis-pact-live.vercel.app';OUT=ROOT/'docs/validation-campaign/live-voice';OUT.mkdir(parents=True,exist_ok=True)
parsed=ast.parse((ROOT/'tests/production_voice_luna.py').read_text(encoding='utf-8'))
script=next(ast.literal_eval(n.value) for n in parsed.body if isinstance(n,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='SCRIPT' for t in n.targets))
script=script.replace("document.querySelector('#cv-sign').disabled","document.querySelector('#ai-apply').disabled")
fixtures=ROOT/'.work/campaign-voice-fixtures';audio={n:base64.b64encode((fixtures/(n+'.wav')).read_bytes()).decode() for n in ['first','correction']}
report={'checkedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'url':URL,'voiceModel':'gpt-live-1','contractModel':'gpt-5.6-luna','humanMicrophone':False,'physicalPhone':False,'operation':'Automated native Edge / ordinary requestAnimationFrame','input':'Microsoft Zira Desktop synthesized fixture through live Web Audio MediaStream','maxReservationsUsd':{'openai':.05,'gateway':.08},'fixtureSha256':{n:hashlib.sha256((fixtures/(n+'.wav')).read_bytes()).hexdigest() for n in audio}}
with sync_playwright() as pw:
 browser=pw.chromium.launch(**launch_kwargs(headless=False),args=['--autoplay-policy=no-user-gesture-required']);ctx=browser.new_context(viewport={'width':1440,'height':900});page=ctx.new_page();page.set_default_timeout(20000);page.add_init_script(script)
 calls=[];errors=[];ids=[];admitted={'voice':0,'text':0}
 def admission(route):
  req=route.request;b=req.post_data_json or {};kind='voice' if req.url.endswith('/voice/start') else 'text' if b.get('action')=='propose' else None
  if kind:
   admitted[kind]+=1
   if admitted[kind]>(1 if kind=='voice' else 8):route.fulfill(status=429,json={'error':'TEST_ALLOWANCE_REACHED'});return
  route.continue_()
 page.route('**/api/voice/start',admission);page.route('**/api/campaign',admission)
 def response(r):
  if '/api/' not in r.url:return
  item={'path':r.url.split(URL)[-1],'status':r.status}
  try:
   b=r.json();item.update({k:b[k] for k in ['provider','model','decision','campaignPact','latencyMs','accountedMicrodollars','signed','stopped','uncertain','error'] if k in b})
   if r.url.endswith('/api/campaign'):item['action']=r.request.post_data_json['action']
   if r.url.endswith('/api/voice/start') and b.get('sessionId'):
    ids.append(b['sessionId']);(ROOT/'.work/campaign-voice-ids.json').write_text(json.dumps(ids),encoding='utf-8')
  except Exception:pass
  calls.append(item)
 page.on('response',response);page.on('pageerror',lambda e:errors.append(str(e)))
 try:
  page.goto(URL+'/?test=1',wait_until='load');page.click('#start');page.click('#hangar-ready');page.click('#launch');page.click('#route-options button:nth-child(2)');page.click('#negotiate');page.check('#ai-consent')
  page.wait_for_function('()=>!document.querySelector("#campaign-voice-start").disabled');start=time.monotonic();page.click('#campaign-voice-start');page.wait_for_function('()=>probe.events.some(e=>e.type==="session.started")');report['connectionMs']=round((time.monotonic()-start)*1000)
  report['firstUtterance']=page.evaluate('playFixture',audio['first'])
  page.wait_for_function('()=>probe.fixtureEnded && remoteLevel()>.005 && performance.now()-(probe.events.filter(e=>e.type==="session.output_transcript.delta").at(-1)?.at||0)<1000')
  report['interruption']=page.evaluate('()=>({at:performance.now(),remoteRms:remoteLevel(),transcript:document.querySelector("#campaign-caption-rival").textContent})')
  report['correctionUtterance']=page.evaluate('playFixture',audio['correction'])
  page.wait_for_function('()=>{const s=JSON.parse(render_game_to_text());return probe.fixtureEnded && s.campaignProposal?.provider==="openai" && s.campaignProposal.decision.contractId==="mirror" && !document.querySelector("#ai-apply").disabled;}',timeout=30000)
  report['unsigned']=json.loads(page.evaluate('render_game_to_text()'));assert report['unsigned']['campaignPact'] is None
  assert any(x.get('model')=='gpt-5.6-luna' for x in calls)
  page.screenshot(path=str(OUT/'01-corrected-pact.png'))
  page.evaluate('()=>{const w=__PACT_TEST__.world,sign=w.sign;w.sign=function(id){const before={hp:this.p.hp,time:this.time,credits:this.credits};const ok=sign.call(this,id);window.campaignSignEvidence={before,after:{hp:this.p.hp,time:this.time,credits:this.credits},mods:{...this.mods},ok,id};return ok;};}')
  page.click('#ai-apply');page.wait_for_function('()=>__PACT_TEST__.screen==="game"',timeout=15000);report['signature']=page.evaluate('campaignSignEvidence')
  assert report['signature']['ok'] and report['signature']['before']==report['signature']['after'];assert report['signature']['mods']['reflect']==2.2 and report['signature']['mods']['gun']==.75
  page.wait_for_timeout(5500);report['combat']=json.loads(page.evaluate('render_game_to_text()'));assert report['combat']['seconds']>=4 and report['combat']['campaignPact']=='mirror';assert 'gpt-5.6-luna' in report['combat']['campaignPactSource']
  page.screenshot(path=str(OUT/'02-signed-combat.png'));page.keyboard.press('Escape');report['success']=True
 except Exception as e:
  report['success']=False;report['failure']=str(e);page.screenshot(path=str(OUT/'failure.png'));raise
 finally:
  try:
   if page.is_visible('#campaign-voice-stop') and page.is_enabled('#campaign-voice-stop'):page.click('#campaign-voice-stop')
   page.wait_for_function('()=>probe.tracks.every(t=>t.readyState==="ended") && probe.peers.every(p=>p.connectionState==="closed")',timeout=16000)
   report['events']=page.evaluate('probe.events');report['sent']=page.evaluate('probe.sent');report['tracks']=page.evaluate('probe.tracks.map(t=>t.readyState)');report['peers']=page.evaluate('probe.peers.map(p=>p.connectionState)');report['inputSignObservations']=page.evaluate('probe.inputs')
  except Exception as e:report['cleanupFailure']=str(e)
  report.update(api=calls,pageErrors=errors,browser=browser.version,admitted=admitted)
  (OUT/'result.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps({k:report.get(k) for k in ['success','failure','connectionMs','admitted','pageErrors','tracks','peers']},ensure_ascii=False));ctx.close();browser.close()
