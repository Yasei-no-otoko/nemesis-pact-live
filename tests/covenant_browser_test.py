"""Real Chromium / software WebGL2 interaction regression. No AI inference.
Controlled simulation advances use legal inputs; not an end-user performance study.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_env import launch_kwargs, evidence_dir
import hashlib, json
R=Path(__file__).resolve().parents[1]
OUT=evidence_dir('browser/covenant')
HTML=(R/'dist/NEMESIS-PACT.html').read_text(encoding='utf-8')
results=[]
with sync_playwright() as pw:
    b=pw.chromium.launch(**launch_kwargs(headless=False),args=['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    for name,w,h,mobile in [('desktop',1280,800,False),('portrait',390,844,True),('small',320,568,True)]:
        c=b.new_context(viewport={'width':w,'height':h},has_touch=mobile,is_mobile=mobile,device_scale_factor=1,offline=True)
        p=c.new_page();p.set_default_timeout(6000); errors=[]; network=[]; checks=[]
        p.on('pageerror',lambda e:errors.append(str(e)))
        p.on('request',lambda r:network.append(r.url) if r.url.startswith(('http:','https:','ws:','wss:')) else None)
        p.evaluate('window.__PACT_TEST_MODE__=true;window.requestAnimationFrame=()=>0')
        p.set_content(HTML)
        p.evaluate('async()=>{await NEMESIS_RENDERER.initialized;__PACT_TEST__.render(3)}')
        assert p.evaluate('NEMESIS_RENDERER.stats().backend')=='WEBGL2 / PBR'
        p.screenshot(path=str(OUT/f'{name}-01-title.png'))
        p.click('#first-contact')
        initial=p.evaluate('JSON.stringify(__PACT_TEST__.world)')
        p.click('#cv-propose'); p.wait_for_function('!document.getElementById("cv-sign").disabled')
        assert initial==p.evaluate('JSON.stringify(__PACT_TEST__.world)')
        assert 'LOCAL RULES' in p.inner_text('#cv-provider')
        checks.append('Proposal is visibly local and cannot mutate the world')
        p.fill('#cv-prompt','Put the sanctuary on the right.')
        assert p.locator('#cv-sign').is_disabled()
        p.fill('#cv-prompt','Move the sanctuary to the left. Slow your bullets. I accept reinforcements.')
        p.click('#cv-propose');p.wait_for_function('!document.getElementById("cv-sign").disabled')
        p.evaluate('__PACT_TEST__.renderCovenantPreview(3)')
        assert p.evaluate("document.querySelector('#covenant-screen').scrollWidth<=document.querySelector('#covenant-screen').clientWidth+1")
        p.screenshot(path=str(OUT/f'{name}-02-contract.png'))
        checks.append('Editing invalidates signature; responsive contract does not overflow horizontally')
        p.click('#cv-sign')
        assert p.evaluate('__PACT_TEST__.world.spec.zone')=='left'
        assert p.evaluate('__PACT_TEST__.world.mods.speed')==.72
        assert p.evaluate('__PACT_TEST__.world.revision')==1
        p.evaluate('__PACT_TEST__.advance(960,{shoot:true,autoAim:true,mx:-.35,parry:true})')
        before=p.evaluate('JSON.stringify(__PACT_TEST__.world)')
        p.evaluate('__PACT_TEST__.render(8);__PACT_TEST__.render(8.1)')
        assert before==p.evaluate('JSON.stringify(__PACT_TEST__.world)')
        p.evaluate("document.getElementById('announcement').style.visibility='hidden'")
        p.screenshot(path=str(OUT/f'{name}-03-combat.png'))
        p.evaluate('__PACT_TEST__.advance(1250,{shoot:true,autoAim:true,parry:true})')
        assert p.evaluate('__PACT_TEST__.world.phase')=='parley'
        frozen=p.evaluate('JSON.stringify(__PACT_TEST__.world)')
        p.evaluate('__PACT_TEST__.advance(1200,{shoot:true,autoAim:true})')
        assert frozen==p.evaluate('JSON.stringify(__PACT_TEST__.world)')
        checks.append('Render is simulation-pure; 18-second parley freezes combat')
        p.fill('#cv-prompt','Amplify my reflected bullets and slow your fire. My gun can be weaker.')
        p.click('#cv-propose');p.wait_for_function('!document.getElementById("cv-sign").disabled')
        assert frozen==p.evaluate('JSON.stringify(__PACT_TEST__.world)')
        p.evaluate('__PACT_TEST__.renderCovenantPreview(8)')
        p.screenshot(path=str(OUT/f'{name}-04-amendment.png'))
        hp=p.evaluate('[__PACT_TEST__.world.time,__PACT_TEST__.world.p.hp,__PACT_TEST__.world.enemies.find(e=>e.type==="boss").hp]')
        p.click('#cv-sign')
        assert p.evaluate('__PACT_TEST__.world.revision')==2
        assert p.evaluate('__PACT_TEST__.world.amendments')==0
        assert p.evaluate('__PACT_TEST__.world.mods.reflect')==1.8
        assert hp==p.evaluate('[__PACT_TEST__.world.time,__PACT_TEST__.world.p.hp,__PACT_TEST__.world.enemies.find(e=>e.type==="boss").hp]')
        checks.append('Signed amendment applies exactly once, preserving clock, hull and boss HP')
        p.evaluate('__PACT_TEST__.advance(600,{shoot:true,autoAim:true,parry:true,mx:.35})')
        p.screenshot(path=str(OUT/f'{name}-05-amended-combat.png'))
        report=p.evaluate('__PACT_TEST__.world.report()')
        assert len(report['receipts'])==2
        assert report['liveVoice']=='not-integrated'
        assert all(x['provider']=='local-rules' for x in report['receipts'])
        p.evaluate('__PACT_TEST__.startFirstContact("BROWSER-CANCEL-CHECK")')
        p.click('#cv-propose');p.wait_for_function('!document.getElementById("cv-sign").disabled');p.click('#cv-sign')
        p.evaluate('__PACT_TEST__.advance(980,{shoot:true,autoAim:true});__PACT_TEST__.openParley()')
        t=p.evaluate('__PACT_TEST__.world.time')
        p.click('#cv-close')
        assert p.evaluate('__PACT_TEST__.world.phase')=='combat'
        assert p.evaluate('__PACT_TEST__.world.amendments')==1
        assert p.evaluate('__PACT_TEST__.world.time')==t
        checks.append('Cancel resumes signed rules without spending the amendment')
        p.evaluate('__PACT_TEST__.openParley()')
        p.locator('.cv-connection summary').click()
        p.locator('#cv-mode').select_option('server')
        p.click('#cv-propose')
        assert 'Consent' in p.inner_text('#cv-status')
        assert p.locator('#cv-sign').is_disabled()
        p.locator('#cv-consent').check();p.click('#cv-propose')
        assert 'hosted' in p.inner_text('#cv-status')
        assert p.locator('#cv-sign').is_disabled()
        checks.append('Consent and standalone guards reject server mode without network')
        assert not errors,errors
        assert not network,network
        results.append({'name':name,'viewport':[w,h],'checks':checks,'report':report,'errors':errors,'externalRequests':network})
        print(name,len(checks),'checks passed',flush=True)
        c.close()
    (OUT/'covenant-browser-results.json').write_text(json.dumps({'build':'0.5.0','htmlSha256':hashlib.sha256(HTML.encode()).hexdigest(),'browser':b.version,'renderer':'WebGL2 via ANGLE / SwiftShader SOFTWARE','nativeWebGPU':'NOT EXECUTED','realApiCalls':0,'scope':'Controlled browser interactions; no human/device/FPS claim','results':results},indent=2))
    b.close()
