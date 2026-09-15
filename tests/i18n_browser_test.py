"""Real browser UI regression for bilingual presentation and first-visit flight assists.
All contract checks are LOCAL RULES. Mobile viewports are emulated, not physical phones.
"""
from pathlib import Path
import datetime, json, os, sys
from playwright.sync_api import sync_playwright
from browser_env import launch_kwargs

url = os.environ.get('NEMESIS_TEST_URL', 'http://127.0.0.1:8124/')
out = Path(os.environ.get('NEMESIS_VALIDATION_DIR', 'docs/validation-japanese/local'))
out.mkdir(parents=True, exist_ok=True)
report = {'checkedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'url': url,
          'physicalMobile': False, 'paidApiCalls': 0, 'cases': [], 'untranslated': {}}

def snapshot(p):
    return p.evaluate('JSON.parse(render_game_to_text())')

def capture(p, name):
    p.evaluate('__PACT_TEST__.render(3)')
    p.screenshot(path=str(out / f'{name}.png'))
    report['untranslated'][name] = p.evaluate('''()=>{
      const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),out=[];let n;
      while(n=w.nextNode()){
        const e=n.parentElement,s=n.nodeValue.trim();
        if(!e||!s||e.closest('script,style,textarea,kbd,[data-i18n-ignore],#cv-caption-player,#cv-caption-notary,#campaign-caption-player,#campaign-caption-rival'))continue;
        if(!e.getClientRects().length||getComputedStyle(e).visibility==='hidden')continue;
        if(/[a-zA-Z]{3}/.test(s)&&!/[\u3040-\u30ff\u3400-\u9fff]/.test(s))out.push(s);
      }return [...new Set(out)];}''')

with sync_playwright() as pw:
    b = pw.chromium.launch(**launch_kwargs(), args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    report['browser'] = b.version
    for label, width, height, touch in [('desktop',1440,900,False),('laptop',1280,720,False),('phone',430,932,True),('small-phone',320,568,True)]:
        c=b.new_context(locale='ja-JP',viewport={'width':width,'height':height},has_touch=touch,is_mobile=touch)
        c.add_init_script('window.__PACT_TEST_MODE__=true;window.requestAnimationFrame=()=>0;')
        p=c.new_page();p.set_default_timeout(10000);errors=[];api=[]
        p.on('pageerror',lambda e:errors.append(str(e)))
        p.on('request',lambda r:api.append(r.url) if '/api/' in r.url else None)
        p.goto(url,wait_until='domcontentloaded');p.evaluate('async()=>{await NEMESIS_RENDERER.initialized;__PACT_TEST__.render(2)}')
        assert p.locator('html').get_attribute('lang')=='ja'
        assert snapshot(p)['assists']=={'autoShot':True,'aimAssist':True}
        capture(p,label+'-title')
        p.select_option('#title-language','en');assert p.locator('#settings').inner_text()=='Settings ↗'
        p.reload(wait_until='domcontentloaded');assert p.locator('html').get_attribute('lang')=='en'
        p.select_option('#title-language','ja');p.click('#settings')
        capture(p,label+'-settings')
        if not touch:
            p.uncheck('#autofire');p.uncheck('#autoaim')
        p.select_option('#settings-language','en');assert p.locator('#title-language').input_value()=='en'
        p.select_option('#settings-language','ja');p.click('#settings-close')
        p.reload(wait_until='domcontentloaded')
        assert p.locator('html').get_attribute('lang')=='ja'
        if not touch:assert snapshot(p)['assists']=={'autoShot':False,'aimAssist':False}
        p.click('#first-contact');p.click('#cv-open-connection');p.select_option('#cv-mode','local');p.click('#cv-use-local')
        p.fill('#cv-prompt','左を安全にして、弾を遅くしてください。増援は許可します。')
        before=p.evaluate('JSON.stringify(__PACT_TEST__.world)')
        p.click('#cv-propose');p.wait_for_function('()=>!document.getElementById("cv-sign").disabled')
        assert p.evaluate('JSON.stringify(__PACT_TEST__.world)')==before
        assert '署名' in p.locator('#cv-sign').inner_text()
        assert snapshot(p)['proposal']['spec']['zone']=='left'
        capture(p,label+'-contract')
        if touch:p.click('#cv-tab-review')
        p.click('#cv-sign');assert snapshot(p)['spec']['zone']=='left'
        p.evaluate('advanceTime(500)')
        capture(p,label+'-combat')
        p.click('#pause-btn');p.click('#pause-settings')
        signed=p.evaluate('JSON.stringify(__PACT_TEST__.world)')
        p.select_option('#settings-language','en');p.select_option('#settings-language','ja')
        assert p.evaluate('JSON.stringify(__PACT_TEST__.world)')==signed
        p.click('#settings-close');p.click('#resume')
        p.evaluate('advanceTime(100)');assert snapshot(p)['seconds']>0.5
        assert p.evaluate('document.documentElement.scrollWidth<=innerWidth')
        assert not errors and not api,(errors,api)
        report['cases'].append({'name':label,'width':width,'height':height,'touchEmulation':touch,'autoLanguage':'ja',
            'manualOverridePersists':True,'savedAssistsPreserved':True,'signatureAndLocaleContinuity':True,'pageErrors':errors,'apiRequests':api,'renderer':snapshot(p)['renderer']})
        print(label,'PASS: locale/persistence/defaults/sign/combat/continuity',flush=True);c.close()

    # First-visit defaults cause actual shots in normal campaign combat without a firing input.
    c=b.new_context(locale='en-US',viewport={'width':1280,'height':800})
    c.add_init_script('window.__PACT_TEST_MODE__=true;window.requestAnimationFrame=()=>0;')
    p=c.new_page();p.goto(url,wait_until='domcontentloaded');assert p.locator('html').get_attribute('lang')=='en'
    p.evaluate('__PACT_TEST__.setCampaign("classic","vanguard");__PACT_TEST__.start(false,"JA-DEFAULT-ASSISTS");__PACT_TEST__.choose("mirror");advanceTime(700)')
    assert p.evaluate('__PACT_TEST__.world.bullets.some(b=>!b.hostile)')
    report['newUserNormalCampaignAutoShot']=True
    p.click('#pause-btn');p.click('#pause-settings');p.uncheck('#autofire');p.uncheck('#autoaim');p.reload(wait_until='domcontentloaded')
    assert snapshot(p)['assists']=={'autoShot':False,'aimAssist':False}
    report['explicitFalseSurvivesReload']=True;c.close()

    # Authored campaign choices, signed local pact, Director and result presentation.
    c=b.new_context(locale='ja-JP',viewport={'width':1440,'height':900})
    c.add_init_script('window.__PACT_TEST_MODE__=true;window.requestAnimationFrame=()=>0;')
    p=c.new_page();errors=[];api=[]
    p.on('pageerror',lambda e:errors.append(str(e)))
    p.on('request',lambda r:api.append(r.url) if '/api/' in r.url else None)
    p.goto(url,wait_until='domcontentloaded')
    p.click('#start');capture(p,'campaign-hangar')
    p.click('#hangar-ready');capture(p,'campaign-loadout')
    p.evaluate('__PACT_TEST__.setCampaign("classic","vanguard");__PACT_TEST__.start(false,"JA-CAMPAIGN")')
    capture(p,'campaign-choices');p.click('#negotiate');p.select_option('#ai-mode','mock')
    p.fill('#ai-prompt','反射を強くしてください。通常射撃は弱くなっても構いません。')
    before=p.evaluate('JSON.stringify(__PACT_TEST__.world)')
    p.click('#ai-request');p.wait_for_function('!document.getElementById("ai-apply").disabled')
    assert p.evaluate('JSON.stringify(__PACT_TEST__.world)')==before
    capture(p,'campaign-pact');p.click('#ai-apply');p.wait_for_function('__PACT_TEST__.world.phase==="combat"')
    assert snapshot(p)['campaignPact']=='mirror'
    p.evaluate('advanceTime(700)');capture(p,'campaign-combat')
    # Direct state fixture for the result UI, not evidence of a completed human playthrough.
    p.evaluate('__PACT_TEST__.world.phase="dead";__PACT_TEST__.results()');capture(p,'campaign-result-fixture')
    p.evaluate('__PACT_TEST__.setCampaign("expedition","vanguard");__PACT_TEST__.start(false,"JA-DIRECTOR");__PACT_TEST__.openAI("director")')
    p.select_option('#ai-mode','mock');p.fill('#ai-prompt','追尾する編成にしてください。')
    before=p.evaluate('JSON.stringify(__PACT_TEST__.world)')
    p.click('#ai-request');p.wait_for_function('!document.getElementById("ai-apply").disabled')
    assert p.evaluate('JSON.stringify(__PACT_TEST__.world)')==before
    capture(p,'campaign-director');p.click('#ai-apply');p.wait_for_function('__PACT_TEST__.screen!=="ai-screen"')
    assert not errors and not api,(errors,api)
    report['campaign']={'localSignPreservesCanonicalMirror':True,'directorProposalDoesNotMutateWorld':True,'directorApplied':True,'resultScreenFixture':True,'pageErrors':errors,'apiRequests':api}
    c.close()

    c=b.new_context(locale='ja-JP',viewport={'width':1280,'height':800})
    c.add_init_script('window.__PACT_TEST_MODE__=true;window.requestAnimationFrame=()=>0;Storage.prototype.getItem=()=>{throw new Error("storage unavailable")};Storage.prototype.setItem=()=>{throw new Error("storage unavailable")};')
    p=c.new_page();p.goto(url,wait_until='domcontentloaded');assert p.locator('html').get_attribute('lang')=='ja'
    p.select_option('#title-language','en');assert p.locator('html').get_attribute('lang')=='en'
    report['blockedStorageSessionSwitchWorks']=True;c.close();b.close()

intentional_english={'NEMESIS','PACT','1.3.0 / WEBGL2 / PBR','1.3.0 / WEBGPU / PBR','1.3.0 / CANVAS'}
missing={name:[x for x in values if x not in intentional_english] for name,values in report['untranslated'].items()}
missing={name:values for name,values in missing.items() if values}
assert not missing,missing
report['authoredVisibleTranslationAuditPassed']=True
report['passed']=True
(out/'result.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Bilingual browser regression passed.',flush=True)
