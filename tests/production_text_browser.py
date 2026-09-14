"""Paid production verification. Real Edge, real model, normal keyboard/pointer input.
No fake API, mutable game fixture, synthetic time or microphone input.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_env import launch_kwargs
import json, time, hashlib

OUT=Path(__file__).resolve().parents[1]/'docs/validation-current/production-text'
OUT.mkdir(parents=True, exist_ok=True)
URL='https://nemesis-pact-live.vercel.app'
def state(p): return json.loads(p.evaluate('render_game_to_text()'))
with sync_playwright() as pw:
    browser=pw.chromium.launch(**launch_kwargs(), args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    context=browser.new_context(viewport={'width':1280,'height':800})
    page=context.new_page(); page.set_default_timeout(25000)
    errors=[]; api=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    def response(r):
        if '/api/' not in r.url: return
        entry={'path':r.url.split(URL)[-1],'status':r.status}
        if '/api/covenant' in r.url:
            try:
                body=r.json()
                entry.update({k:body[k] for k in ['provider','model','spec','latencyMs','usage','signed','revision','error','billedBy'] if k in body})
            except Exception: pass
        api.append(entry)
    page.on('response',response)
    start=time.monotonic(); home=page.goto(URL,wait_until='networkidle')
    page.wait_for_function('()=>typeof render_game_to_text==="function"')
    evidence={'url':URL,'utc':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'browser':browser.version,'viewport':[1280,800],'automated':True,'physicalPhone':False,'renderer':'software WebGL2 / ANGLE SwiftShader','controlledTime':False,'homeStatus':home.status,'startupMs':round((time.monotonic()-start)*1000),'headers':{k:v for k,v in home.headers.items() if k in ['permissions-policy','x-content-type-options','referrer-policy']},'checks':[]}
    try:
        page.screenshot(path=str(OUT/'01-title.png'))
        page.click('#first-contact'); page.click('#cv-open-connection');page.check('#cv-consent');page.click('#cv-connection-done')
        page.wait_for_function('()=>!document.querySelector("#cv-voice-start").disabled')
        before=state(page)
        page.fill('#cv-prompt','Move the sanctuary to the left. Slow your bullets. I accept reinforcements.')
        page.click('#cv-propose'); page.wait_for_function('()=>!document.querySelector("#cv-sign").disabled')
        proposal=state(page)
        assert proposal['proposal']['provider']=='openai', page.inner_text('#cv-status')
        assert proposal['revision']==before['revision']==0
        assert proposal['proposal']['spec']['zone']=='left'
        assert proposal['proposal']['spec']['speed']=='slow'
        evidence['checks'].append('Real OpenAI model proposes left sanctuary and slower bullets; revision remains zero before Sign')
        page.screenshot(path=str(OUT/'02-real-proposal.png'))
        page.click('#cv-sign'); page.wait_for_function('()=>JSON.parse(render_game_to_text()).revision===1')
        page.keyboard.down('Space');page.keyboard.down('ArrowLeft');page.wait_for_timeout(1100);page.keyboard.up('ArrowLeft')
        page.wait_for_function('()=>JSON.parse(render_game_to_text()).seconds>=10',timeout=70000)
        combat=state(page); evidence['combat']=combat
        page.screenshot(path=str(OUT/'03-signed-combat.png'))
        assert combat['spec']['zone']=='left' and combat['spec']['speed']=='slow'
        assert combat['revision']==1 and combat['seconds']>0
        evidence['checks'].append('Explicit signature applied the real model clauses to a running combat world')
        if combat['phase']=='combat': page.keyboard.press('KeyR')
        page.keyboard.up('Space')
        page.wait_for_function('()=>JSON.parse(render_game_to_text()).phase==="parley"')
        frozen=state(page)
        page.fill('#cv-prompt','Move the sanctuary to the right. Keep slow hostile bullets. Reinforcements are acceptable.')
        page.click('#cv-propose'); page.wait_for_function('()=>!document.querySelector("#cv-sign").disabled')
        amended=state(page)
        assert amended['proposal']['provider']=='openai'
        assert amended['proposal']['spec']['zone']=='right'
        assert amended['seconds']==frozen['seconds'] and amended['player']['hp']==frozen['player']['hp']
        page.screenshot(path=str(OUT/'04-real-amendment.png'))
        page.click('#cv-sign');page.wait_for_function('()=>JSON.parse(render_game_to_text()).revision===2')
        signed=state(page)
        assert signed['spec']['zone']=='right' and signed['player']['hp']==frozen['player']['hp']
        assert signed['seconds']>=frozen['seconds'] and signed['seconds']-frozen['seconds']<.5
        before_boss=[x['hp'] for x in frozen['enemies'] if x['type']=='boss']
        after_boss=[x['hp'] for x in signed['enemies'] if x['type']=='boss']
        assert before_boss==after_boss
        evidence['amendment']={'before':frozen,'after':signed}
        evidence['checks'].append('Second real model contract signed once; sanctuary moves right; player HP, boss HP and elapsed combat time preserved')
        page.wait_for_timeout(1200);page.screenshot(path=str(OUT/'05-amended-combat.png'))
        evidence['success']=True
    except Exception as e:
        evidence['success']=False;evidence['failure']=str(e);page.screenshot(path=str(OUT/'failure.png'))
    finally:
        evidence['api']=api;evidence['pageErrors']=errors
        (OUT/'result.json').write_text(json.dumps(evidence,indent=2),encoding='utf-8')
        print(json.dumps({'success':evidence['success'],'checks':evidence['checks'],'failure':evidence.get('failure'),'api':api,'pageErrors':errors},indent=2))
        context.close();browser.close()
    if not evidence['success']: raise SystemExit(1)
