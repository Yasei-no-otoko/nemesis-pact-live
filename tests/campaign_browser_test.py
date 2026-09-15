"""Campaign pact UI on a native browser; physical phones and human speech are separate evidence."""
from pathlib import Path
import argparse,json,time
from playwright.sync_api import sync_playwright
from browser_env import launch_kwargs
ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('--url');p.add_argument('--live',action='store_true');p.add_argument('--out',default='docs/validation-campaign/local-browser');a=p.parse_args()
out=ROOT/a.out;out.mkdir(parents=True,exist_ok=True);reports=[]
with sync_playwright() as pw:
 browser=pw.chromium.launch(**launch_kwargs(headless=False))
 for name,width,height,mobile in ([('desktop',1440,900,False)] if a.live else [('desktop',1440,900,False),('laptop',1280,720,False),('phone',430,932,True),('small-phone',320,568,True)]):
  ctx=browser.new_context(viewport={'width':width,'height':height},is_mobile=mobile,has_touch=mobile);page=ctx.new_page();errors=[];calls=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  def response(r):
   if r.url.endswith('/api/campaign'):
    try:b=r.json()
    except Exception:return
    calls.append({'action':r.request.post_data_json['action'],'status':r.status,**{k:b.get(k) for k in ['provider','model','decision','latencyMs','accountedMicrodollars','signed']}})
  page.on('response',response)
  page.goto((a.url or (ROOT/'dist/NEMESIS-PACT.html').as_uri())+'?test=1',wait_until='load')
  page.click('#start');page.click('#hangar-ready');page.click('#launch');page.click('#route-options button:nth-child(2)');page.click('#negotiate')
  if a.live:
   page.click('#ai-request');assert 'Confirm' in page.inner_text('#ai-status');assert not calls;page.check('#ai-consent')
  else: page.select_option('#ai-mode','mock')
  page.fill('#ai-prompt','敵弾を反射して戦いたい。自分の通常弾は弱くてよい。' if a.live else 'Let me reflect your attacks. My gun can be weaker.')
  before=page.evaluate('({hp:__PACT_TEST__.world.p.hp,time:__PACT_TEST__.world.time,credits:__PACT_TEST__.world.credits,pact:__PACT_TEST__.world.pact})')
  page.click('#ai-request');page.wait_for_function('()=>!document.querySelector("#ai-apply").disabled',timeout=25000)
  assert ('gpt-5.6-luna' if a.live else 'LOCAL RULES') in page.inner_text('#ai-provider')
  assert '2.2' in page.inner_text('#ai-benefit');assert page.evaluate('__PACT_TEST__.world.pact')==before['pact']
  if not a.live:
   page.fill('#ai-prompt','Slow bullets');assert page.is_disabled('#ai-apply');page.fill('#ai-prompt','Reflect your attacks');page.click('#ai-request');page.wait_for_function('()=>!document.querySelector("#ai-apply").disabled')
  layout=page.evaluate('()=>{const e=document.querySelector("#ai-screen");return {width:e.clientWidth,scrollWidth:e.scrollWidth,height:e.clientHeight,scrollHeight:e.scrollHeight};}')
  assert layout['scrollWidth']<=layout['width']+1,layout
  if not mobile: assert layout['scrollHeight']<=layout['height']+1,layout
  page.screenshot(path=str(out/f'{name}-proposal.png'))
  page.evaluate('()=>{const w=__PACT_TEST__.world,sign=w.sign;w.sign=function(id){const before={hp:this.p.hp,time:this.time,credits:this.credits};const ok=sign.call(this,id);window.campaignSignature={ok,before,after:{hp:this.p.hp,time:this.time,credits:this.credits},mods:{...this.mods},id};return ok;};}')
  page.click('#ai-apply');page.wait_for_function('()=>__PACT_TEST__.screen==="game"',timeout=15000)
  signature=page.evaluate('campaignSignature');assert signature['ok'] and signature['before']==signature['after'];assert signature['id']=='mirror';assert signature['mods']['reflect']==2.2 and signature['mods']['gun']==.75
  page.wait_for_timeout(2500);runtime=json.loads(page.evaluate('render_game_to_text()'));assert runtime['seconds']>1 and runtime['campaignPact']=='mirror';assert ('OPENAI' if a.live else 'LOCAL RULES') in runtime['campaignPactSource']
  page.screenshot(path=str(out/f'{name}-combat.png'));page.keyboard.press('Escape');assert not errors,errors
  reports.append({'viewport':[width,height],'mobileEmulation':mobile,'before':before,'signature':signature,'layout':layout,'runtime':runtime,'errors':errors,'api':calls});ctx.close()
 result={'checkedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'live':a.live,'browser':browser.version,'humanInput':False,'physicalPhone':False,'clock':'ordinary requestAnimationFrame','reports':reports}
 (out/'results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps(result,ensure_ascii=False));browser.close()
