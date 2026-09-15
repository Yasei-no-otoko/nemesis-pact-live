"""Native browser Director flow. --live performs one real, quota-bound text call.
Local screenshots and mobile sizes are emulation, not physical-device evidence.
"""
from pathlib import Path
import argparse,json,time
from playwright.sync_api import sync_playwright
from browser_env import launch_kwargs

ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser();parser.add_argument('--url');parser.add_argument('--live',action='store_true');parser.add_argument('--out',default='docs/validation-director/local-browser');args=parser.parse_args()
OUT=ROOT/args.out;OUT.mkdir(parents=True,exist_ok=True)
url=args.url or (ROOT/'dist/NEMESIS-PACT.html').as_uri()
reports=[]
with sync_playwright() as pw:
 browser=pw.chromium.launch(**launch_kwargs(headless=False))
 sizes=[('desktop',1440,900,False)] if args.live else [('desktop',1440,900,False),('laptop',1280,720,False),('phone',430,932,True),('small-phone',320,568,True)]
 for name,width,height,mobile in sizes:
  context=browser.new_context(viewport={'width':width,'height':height},has_touch=mobile,is_mobile=mobile,device_scale_factor=1)
  page=context.new_page();errors=[];api=[];responses=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.on('request',lambda r:api.append({'path':r.url.split('/api/')[-1],'method':r.method}) if '/api/' in r.url else None)
  def response(r):
   if r.url.endswith('/api/director'):
    try:
     v=r.json();responses.append({k:v.get(k) for k in ['provider','model','decision','latencyMs','reason','billedBy','reservedMicrodollars','accountedMicrodollars']})
    except Exception: pass
  page.on('response',response)
  page.goto(url+'?test=1',wait_until='load');page.wait_for_function('!!window.__PACT_TEST__')
  page.click('#start');page.click('#hangar-ready');page.click('#launch');page.click('#route-intelligence')
  if args.live:
   assert page.input_value('#ai-mode')=='server'
   page.click('#ai-request');assert 'Confirm' in page.inner_text('#ai-status');assert len(api)==0
   page.check('#ai-consent')
  else: page.select_option('#ai-mode','mock')
  page.fill('#ai-prompt','追撃ではなく、間隔に余裕のあるクロスファイア編隊でお願いします。' if args.live else 'A crossfire lattice with fair gaps.')
  before=page.evaluate('({hp:__PACT_TEST__.world.p.hp,time:__PACT_TEST__.world.time,credits:__PACT_TEST__.world.credits,pact:__PACT_TEST__.world.pact,director:__PACT_TEST__.world.director})')
  page.click('#ai-request');page.wait_for_function("!document.querySelector('#ai-apply').disabled",timeout=25000)
  assert page.evaluate('__PACT_TEST__.world.director')=='balanced'
  provider=page.inner_text('#ai-provider');assert ('gpt-5.6-luna' if args.live else 'LOCAL RULES') in provider,provider
  assert page.get_attribute('#ai-director-preview','data-proposed')=='crossfire'
  if not args.live:
   page.click('#ai-suggestions button:nth-child(2)');assert page.is_disabled('#ai-apply')
   page.click('#ai-suggestions button:nth-child(3)');page.click('#ai-request');page.wait_for_function("!document.querySelector('#ai-apply').disabled")
  assert page.evaluate('document.querySelector("#ai-screen").scrollWidth<=document.querySelector("#ai-screen").clientWidth+1')
  page.locator('#ai-director-preview').scroll_into_view_if_needed()
  page.screenshot(path=str(OUT/f'{name}-proposal.png'))
  layout=page.evaluate('({height:document.querySelector("#ai-screen").clientHeight,scroll:document.querySelector("#ai-screen").scrollHeight,button:document.querySelector("#ai-apply").getBoundingClientRect().toJSON()})')
  plan=page.evaluate("__PACT_TEST__.world.formationPlan('crossfire','salvage')")
  page.click('#ai-apply');page.wait_for_function("__PACT_TEST__.screen==='route'",timeout=12000)
  after=page.evaluate('({hp:__PACT_TEST__.world.p.hp,time:__PACT_TEST__.world.time,credits:__PACT_TEST__.world.credits,pact:__PACT_TEST__.world.pact,director:__PACT_TEST__.world.director})')
  assert after=={**before,'director':'crossfire'},[before,after]
  assert ('OPENAI' if args.live else 'LOCAL RULES') in page.inner_text('#shop-status')
  page.click('#route-options button:nth-child(2)')
  page.evaluate("()=>{window.directorSpawnEvidence=[];const original=PactExpansion.Run.prototype.spawn;PactExpansion.Run.prototype.spawn=function(...args){const e=original.apply(this,args);if(e)window.directorSpawnEvidence.push({type:e.type,waveTime:this.waveTime});return e;};}")
  # The campaign's authored pact still requires its own ordinary confirmation.
  page.evaluate('__PACT_TEST__.choose(__PACT_TEST__.world.offersForPact()[0].id)')
  assert page.evaluate('__PACT_TEST__.world.wavePlan')==plan
  page.wait_for_timeout(3300)
  runtime=page.evaluate('({renderer:NEMESIS_RENDERER.stats().backend,phase:__PACT_TEST__.world.phase,seconds:__PACT_TEST__.world.time,planIndex:__PACT_TEST__.world.planIndex,enemies:__PACT_TEST__.world.enemies.map(e=>e.type),spawns:window.directorSpawnEvidence,bullets:__PACT_TEST__.world.bullets.length,director:__PACT_TEST__.world.director})')
  assert runtime['planIndex']>=2 and runtime['spawns'][0]['type']=='turret',runtime
  assert [s['type'] for s in runtime['spawns'][:2]]==[p['type'] for p in plan[:2]],runtime
  page.screenshot(path=str(OUT/f'{name}-combat.png'))
  page.keyboard.press('Escape')
  assert not errors,errors
  if not args.live: assert not api,api
  reports.append({'viewport':[width,height],'mobileEmulation':mobile,'provider':provider,'beforeApply':before,'afterApply':after,'layout':layout,'scheduledWave':plan,'runtime':runtime,'errors':errors,'api':api,'modelResponses':responses})
  context.close()
 result={'checkedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'browser':browser.version,'humanInput':False,'physicalPhone':False,'clock':'ordinary requestAnimationFrame; no time acceleration','live':args.live,'url':url if args.url else 'offline standalone HTML','reports':reports}
 (OUT/'results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
 print(json.dumps(result,ensure_ascii=False));browser.close()
