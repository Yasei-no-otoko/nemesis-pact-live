"""End-of-run review UI regression. Finished states replay archived aggregate data.
Network stubs here verify UI failure/cancel/cache behavior, not real model inference.
Set NEMESIS_DEBRIEF_LIVE=1 only for the two bounded real production Luna calls.
"""
from pathlib import Path
import datetime, json, os, time
from playwright.sync_api import sync_playwright
from browser_env import launch_kwargs

url=os.environ.get('NEMESIS_TEST_URL','http://127.0.0.1:8124/')
live=os.environ.get('NEMESIS_DEBRIEF_LIVE')=='1'
out=Path(os.environ.get('NEMESIS_VALIDATION_DIR','docs/validation-debrief/local'));out.mkdir(parents=True,exist_ok=True)
archived=json.loads(Path('docs/validation-adaptive/full-campaign/result.json').read_text(encoding='utf-8'))['victory']
record=archived['runReport']
report={'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'url':url,'realModelCalls':live,'physicalMobile':False,'stateSource':'Archived actual v1.3.0 automated campaign, replayed into a finished-state UI fixture; no new campaign clear claimed','cases':[]}

def wait(p,expression,timeout=22000):
    deadline=time.monotonic()+timeout/1000
    while time.monotonic()<deadline:
        if p.evaluate(expression):return
        p.wait_for_timeout(75)
    raise AssertionError({'waitingFor':expression,'status':p.locator('#debrief-status').inner_text(),'state':p.evaluate('JSON.parse(render_game_to_text()).debrief')})

def setup(p):
    p.goto(url,wait_until='domcontentloaded')
    p.evaluate('''async data=>{
      await NEMESIS_RENDERER.initialized;
      __PACT_TEST__.setCampaign('expedition','bastion');__PACT_TEST__.start(false,'DEBRIEF-UI-FIXTURE');
      const w=__PACT_TEST__.world,r=data.runReport;
      Object.assign(w,{phase:'won',difficulty:r.difficulty,time:r.seconds,kills:r.kills,score:r.score,bossKills:r.bosses,parries:r.parries,grazes:r.grazes,damageTaken:r.damageTaken,breaches:r.breaches,contracts:r.contracts,upgrades:r.upgrades,relics:r.relics,autoplay:true,adaptiveLevel:2});
      w.p.hp=data.player.hp;w.p.maxHp=data.player.hp;__PACT_TEST__.results();__PACT_TEST__.render(4);
    }''',archived)

with sync_playwright() as pw:
    b=pw.chromium.launch(**launch_kwargs(),args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    for locale,width,height in ([('en-US',1440,900),('ja-JP',430,932)] if live else [('en-US',1440,900),('ja-JP',1280,720),('ja-JP',430,932),('ja-JP',320,568)]):
        c=b.new_context(locale=locale,viewport={'width':width,'height':height},has_touch=width<760,is_mobile=width<760)
        c.add_init_script('window.__PACT_TEST_MODE__=true;window.requestAnimationFrame=()=>0;')
        p=c.new_page();p.set_default_timeout(12000);errors=[];calls=[];responses=[]
        p.on('pageerror',lambda e:errors.append(str(e)))
        def capture_request(r):
            if r.url.endswith('/api/debrief'):calls.append(r.post_data_json['request'])
        p.on('request',capture_request)
        if not live:
            c.route('**/api/session',lambda route:route.fulfill(json={'sessionId':'ui-fixture','csrf':'ui-test-csrf','expiresAt':4102444800000,'contractEnabled':True,'voiceEnabled':False}))
            def answer(route):
                r=route.request.post_data_json['request'];d=p.evaluate('r=>PactDebrief.mock(r)',r)
                route.fulfill(json={'provider':'openai','model':'gpt-5.6-luna','runId':r['runId'],'sequence':r['sequence'],'decision':d,'latencyMs':12})
            c.route('**/api/debrief',answer)
        else:
            def capture_response(r):
                if r.url.endswith('/api/debrief'):
                    responses.append({'status':r.status,'body':r.json()})
                    (out/(locale+'-'+str(width)+'-response.json')).write_text(json.dumps(responses,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
            p.on('response',capture_response)
        setup(p);name=locale+'-'+str(width)
        assert 'prototype' not in p.locator('#debrief').inner_text().lower()
        original=p.evaluate('JSON.stringify(__PACT_TEST__.world)')
        p.click('#debrief');assert p.locator('#debrief-analyze').is_disabled()
        assert not calls
        assert p.locator('#debrief-stats').inner_text().count('6 / 6')==2
        assert p.locator('#debrief-provider').inner_text().startswith('LOCAL RULES')
        p.screenshot(path=str(out/(name+'-local.png')))
        p.check('#debrief-consent');p.click('#debrief-analyze')
        wait(p,'document.getElementById("debrief-provider").textContent.startsWith("OPENAI")',timeout=22000)
        assert len(calls)==1
        assert calls[0]['language']==('ja' if locale.startswith('ja') else 'en')
        assert calls[0]['run']['autoplay'] is True and calls[0]['run']['pactsKept']==6
        assert p.evaluate('JSON.stringify(__PACT_TEST__.world)')==original
        if locale.startswith('ja'):
            assert p.evaluate('/[\u3040-\u30ff\u3400-\u9fff]/.test(document.getElementById("debrief-summary").textContent)')
        p.screenshot(path=str(out/(name+'-analysis.png')))
        p.click('#debrief-back');p.click('#debrief');assert len(calls)==1
        assert p.locator('#debrief-provider').inner_text().startswith('OPENAI')
        assert p.locator('#debrief-analyze').is_disabled()
        p.select_option('#debrief-mode','local');assert p.locator('#debrief-provider').inner_text().startswith('LOCAL RULES')
        p.select_option('#debrief-mode','server');p.check('#debrief-consent')
        assert p.locator('#debrief-provider').inner_text().startswith('OPENAI')
        p.uncheck('#debrief-consent');assert p.locator('#debrief-provider').inner_text().startswith('LOCAL RULES')
        p.check('#debrief-consent');assert p.locator('#debrief-provider').inner_text().startswith('OPENAI')
        assert len(calls)==1
        assert p.evaluate('JSON.stringify(__PACT_TEST__.world)')==original
        p.press('#debrief-back','Escape');assert p.evaluate('__PACT_TEST__.screen')=='result'
        assert p.evaluate('document.documentElement.scrollWidth<=innerWidth')
        assert not errors,errors
        report['cases'].append({'locale':locale,'viewport':[width,height],'touchEmulation':width<760,'noCallBeforeConsent':True,'worldAndScoresUnchanged':True,'cachePreventsRepeatCalls':True,'cacheRestoredAfterProviderOrConsentChange':True,'requests':len(calls),'responses':responses,'pageErrors':errors,'renderer':p.evaluate('JSON.parse(render_game_to_text()).renderer')})
        print(name,'PASS: consent/analysis/cache/world continuity',flush=True)
        if not live and width==1440:
            # Clear the per-world cache with a new ended-run fixture, then fail the service.
            setup(p);p.click('#debrief');c.unroute('**/api/debrief');c.route('**/api/debrief',lambda route:route.fulfill(status=429,json={'error':'BUDGET_OR_CONCURRENCY_LIMIT'}))
            p.check('#debrief-consent');p.click('#debrief-analyze');wait(p,'!JSON.parse(render_game_to_text()).debrief.busy')
            assert p.locator('#debrief-provider').inner_text().startswith('LOCAL RULES')
            assert p.locator('#debrief-summary').inner_text()
            report['budgetFailureHasLocalRecord']=True
            # A synthetic hanging upstream proves cancellation and stale-return isolation.
            c.unroute('**/api/debrief');pending=[];c.route('**/api/debrief',lambda route:pending.append(route))
            p.click('#debrief-analyze');wait(p,'JSON.parse(render_game_to_text()).debrief.busy')
            p.click('#debrief-cancel');assert not p.evaluate('JSON.parse(render_game_to_text()).debrief.busy')
            for route in pending:
                try:route.fulfill(status=503,json={'error':'late'})
                except Exception:pass
            assert p.locator('#debrief-provider').inner_text().startswith('LOCAL RULES')
            assert 'STALE' not in p.locator('#debrief-summary').inner_text()
            report['cancellationRetainsLocalRecord']=True
        c.close()
    b.close()
report['passed']=True
(out/'result.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Debrief browser validation passed.',flush=True)
