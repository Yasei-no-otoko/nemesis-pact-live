from pathlib import Path
from playwright.sync_api import sync_playwright
import json
R=Path(__file__).resolve().parents[1]; out=R/'docs/validation-0.5.0';out.mkdir(exist_ok=True)
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=False,args=['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 for name,w,h,mobile in [('desktop',1280,800,False),('portrait',390,844,True),('small',320,568,True)]:
  c=b.new_context(viewport={'width':w,'height':h},has_touch=mobile,is_mobile=mobile,device_scale_factor=1,offline=True)
  p=c.new_page();errs=[];p.on('pageerror',lambda e:errs.append(str(e)))
  p.evaluate('window.__PACT_TEST_MODE__=true;window.requestAnimationFrame=()=>0')
  p.set_content((R/'dist/NEMESIS-PACT.html').read_text());p.evaluate('async()=>{await NEMESIS_RENDERER.initialized;__PACT_TEST__.render(3)}')
  print(name,'backend',p.evaluate('NEMESIS_RENDERER.stats().backend'),errs,flush=True)
  p.screenshot(path=str(out/f'{name}-01-title.png'))
  p.click('#first-contact');p.click('#cv-propose');p.wait_for_function('!document.getElementById("cv-sign").disabled');p.evaluate('__PACT_TEST__.renderCovenantPreview(3)')
  p.screenshot(path=str(out/f'{name}-02-contract.png'))
  p.click('#cv-sign');p.evaluate('__PACT_TEST__.advance(900,{shoot:true,autoAim:true,mx:-.35})');p.evaluate("document.getElementById('announcement').classList.remove('visible')");p.evaluate('__PACT_TEST__.render(7.5)')
  p.screenshot(path=str(out/f'{name}-03-combat.png'))
  print(name,p.evaluate('__PACT_TEST__.snapshot()'),errs,flush=True)
  assert not errs,errs
  c.close()
 b.close()
