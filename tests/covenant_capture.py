"""Capture actual legal-input playthroughs. The pilot observes full state (not human input)."""
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_env import launch_kwargs, evidence_dir
import json,hashlib
R=Path(__file__).resolve().parents[1];O=evidence_dir('browser/covenant-capture');H=(R/'dist/NEMESIS-PACT.html').read_text(encoding='utf-8')
s=(R/'tests/simulate.js').read_text(encoding='utf-8');pilot=s[s.index('function pilot(w)'):s.index('function play(')]
reports=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(**launch_kwargs(headless=False),args=['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 for name,width,height,mobile in [('desktop',1280,800,False),('portrait',390,844,True)]:
  c=b.new_context(viewport={'width':width,'height':height},is_mobile=mobile,has_touch=mobile,offline=True)
  p=c.new_page();errs=[];p.on('pageerror',lambda e:errs.append(str(e)))
  p.evaluate('window.__PACT_TEST_MODE__=true;window.requestAnimationFrame=()=>0');p.set_content(H)
  p.evaluate('async()=>{await NEMESIS_RENDERER.initialized;__PACT_TEST__.startFirstContact("COVENANT-VALIDATION");}')
  p.evaluate('(source)=>{window.capturePilot=new Function("w","const segmentHit=PactCore.segmentHit;"+source+";return pilot(w)");}',pilot)
  p.click('#cv-propose');p.wait_for_function('!document.getElementById("cv-sign").disabled');p.wait_for_timeout(300)
  p.screenshot(path=str(O/f'{name}-first-contact-contract.png'))
  p.click('#cv-sign')
  def advance(n):
   p.evaluate('''n=>{const T=__PACT_TEST__;for(let i=0;i<n&&T.world.phase==='combat';i++){T.world.step(1/120,capturePilot(T.world));T.world.takeEvents();}T.advance(0);document.getElementById('announcement').style.visibility='hidden';T.render(T.world.time);}''',n)
  advance(2400)
  assert p.evaluate('__PACT_TEST__.world.phase')=='parley'
  p.click('#cv-propose');p.wait_for_function('!document.getElementById("cv-sign").disabled');p.wait_for_timeout(300)
  p.screenshot(path=str(O/f'{name}-first-contact-parley.png'))
  p.click('#cv-sign');advance(1200)
  p.screenshot(path=str(O/f'{name}-first-contact-amended-play.png'))
  advance(24000)
  report=p.evaluate('__PACT_TEST__.world.report()');assert report['outcome']=='won',report
  p.screenshot(path=str(O/f'{name}-first-contact-result.png'))
  p.click('#retry')
  assert p.evaluate('__PACT_TEST__.world.mode')=='first-contact'
  assert p.evaluate('__PACT_TEST__.world.phase')=='covenant'
  assert p.evaluate('__PACT_TEST__.world.revision')==0
  assert not errs,errs
  reports.append({'name':name,'report':report,'errors':errs,'retry':'PASS'})
  print(name,'legal-input victory and retry passed',flush=True);c.close()
 (O/'covenant-playthrough-browser.json').write_text(json.dumps({'build':'0.5.0','htmlSha256':hashlib.sha256(H.encode()).hexdigest(),'method':'Full-state heuristic legal-input pilot; no health, boss HP, timer or progression overrides. No live inference. Event particles omitted during fast-forward capture; screenshot is not a physical-device performance test.','results':reports},indent=2))
 b.close()
