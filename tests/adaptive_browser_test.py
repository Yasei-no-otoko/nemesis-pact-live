"""Controlled browser UI regression; model responses below are explicit fixtures, not live evidence."""
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_env import launch_kwargs
import json
OUT=Path('docs/validation-adaptive/ui');OUT.mkdir(parents=True,exist_ok=True)
results=[]
with sync_playwright() as pw:
 browser=pw.chromium.launch(**launch_kwargs(headless=False))
 for width,height,mobile in [(1440,900,False),(1280,720,False),(430,932,True),(320,568,True)]:
  context=browser.new_context(viewport={'width':width,'height':height},is_mobile=mobile,has_touch=mobile)
  page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto('http://127.0.0.1:8122/?test=1');page.click('#start');page.click('#hangar-ready');page.check('#adaptive-enabled');page.check('#autoplay-enabled');page.check('#autoplay-pause-pacts');page.screenshot(path=str(OUT/f'setup-{width}.png'))
  page.click('#launch');page.wait_for_function('()=>JSON.parse(render_game_to_text()).screen==="ai-screen"');page.screenshot(path=str(OUT/f'voice-{width}.png'))
  # Explicit test-only encounter boundary for responsive review, not a claimed playthrough.
  page.evaluate("""()=>{const t=__PACT_TEST__,w=t.world;t.show('choices');w.sign('mirror');w.kills=10;w.parries=4;w.time=20;w.completeEncounter();window.NEMESIS_HOSTED=false;t.adaptiveReview();}""")
  page.wait_for_function('()=>!document.querySelector("#adaptive-continue").disabled');page.screenshot(path=str(OUT/f'review-{width}.png'));state=json.loads(page.evaluate('render_game_to_text()'))
  assert state['adaptive']['history'][0]['after']==0
  page.click('#autoplay-toggle');page.click('#adaptive-continue');assert json.loads(page.evaluate('render_game_to_text()'))['screen']=='choices'
  assert not errors;results.append({'viewport':[width,height],'mobileEmulation':mobile,'physicalPhone':False,'errors':errors,'review':'local hold','operation':'automated controlled encounter fixture'})
  context.close()
 (OUT/'results.json').write_text(json.dumps({'browser':browser.version,'results':results},indent=2),encoding='utf-8');browser.close()
print(json.dumps(results))
