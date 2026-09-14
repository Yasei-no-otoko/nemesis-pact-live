"""Paid production rule-set regression: three actual Gateway calls, ordinary UI.
Windows Edge at an emulated iPhone-size viewport; not physical phone/voice proof.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json,time
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'docs/validation-current/iphone-recording/production-fix';OUT.mkdir(parents=True,exist_ok=True)
URL='https://nemesis-pact-live.vercel.app'
def state(p):return json.loads(p.evaluate('()=>render_game_to_text()'))
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path=r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',headless=True)
 c=b.new_context(viewport={'width':440,'height':956},has_touch=True,is_mobile=True);p=c.new_page();p.set_default_timeout(22000);calls=[];errors=[]
 p.on('pageerror',lambda e:errors.append(str(e)))
 def response(r):
  if '/api/' not in r.url:return
  entry={'path':r.url.split(URL)[-1],'status':r.status}
  try:
   body=r.json();entry.update({k:body[k] for k in ['provider','model','modelFormat','modelIssue','spec','latencyMs','accountedMicrodollars','signed','revision','error'] if k in body})
  except Exception:pass
  calls.append(entry)
 p.on('response',response)
 report={'checkedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'url':URL,'browser':b.version,'viewport':[440,956],'touchEmulation':True,'physicalPhone':False,'humanMicrophone':False,'controlledTime':False}
 def propose(text,zone):
  p.fill('#cv-prompt',text);assert p.locator('#cv-sign').is_disabled();p.click('#cv-propose');p.wait_for_function('()=>!document.querySelector("#cv-sign").disabled')
  s=state(p);assert s['proposal']['provider']=='openai',p.inner_text('#cv-status');assert s['proposal']['spec']['zone']==zone
  return s
 try:
  p.goto(URL,wait_until='networkidle');p.click('#first-contact');p.click('#cv-open-connection');p.check('#cv-consent');p.click('#cv-connection-done')
  left=propose('左を安全にして','left');assert left['revision']==0 and left['spec'] is None
  right=propose('左を安全にしてやっぱり右にして','right');assert right['revision']==0 and right['spec'] is None
  p.locator('#cv-proposal').scroll_into_view_if_needed();p.screenshot(path=str(OUT/'01-corrected-openai-contract.png'))
  p.click('#cv-sign');p.wait_for_function('()=>JSON.parse(render_game_to_text()).revision===1');p.wait_for_function('()=>JSON.parse(render_game_to_text()).seconds>=8.2')
  combat=state(p);assert combat['spec']['zone']=='right';p.screenshot(path=str(OUT/'02-right-combat.png'))
  p.click('#cv-parley');p.wait_for_function('()=>JSON.parse(render_game_to_text()).phase==="parley"');before=state(p)
  amended=propose('結界なし。弾を遅く、反射を強く。通常射撃を弱くしていい','none')
  assert amended['proposal']['spec']['speed']=='slow' and amended['proposal']['spec']['reflection']=='charged' and amended['proposal']['spec']['price']=='weaker_gun'
  assert amended['seconds']==before['seconds'] and amended['player']['hp']==before['player']['hp'] and amended['enemies']==before['enemies']
  p.click('#cv-sign');p.wait_for_function('()=>JSON.parse(render_game_to_text()).revision===2');after=state(p)
  assert after['spec']==amended['proposal']['spec'] and after['player']['hp']==before['player']['hp'] and before['seconds']<=after['seconds']<before['seconds']+.5
  assert [e['hp'] for e in after['enemies'] if e['type']=='boss']==[e['hp'] for e in before['enemies'] if e['type']=='boss']
  proposals=[v for v in calls if v['path']=='/api/covenant'];assert len(proposals)==3 and all(v.get('provider')=='openai' and v.get('modelFormat')=='living_covenant_rules_v3' and v.get('modelIssue') is None for v in proposals)
  assert not errors;p.screenshot(path=str(OUT/'03-amended-combat.png'));report.update(passed=True,renderer=after['renderer'],before=before,after=after,realModelCalls=3)
 except Exception as error:
  report.update(passed=False,error=str(error));p.screenshot(path=str(OUT/'failure.png'))
 finally:
  report.update(api=calls,pageErrors=errors);(OUT/'result.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8');print(json.dumps(report,ensure_ascii=False));c.close();b.close()
 if not report['passed']:raise SystemExit(1)
