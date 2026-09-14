"""Hosted failure-path browser regression. Every upstream/media result is mocked."""
from pathlib import Path
import json, os
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
BASE=os.environ.get('NEMESIS_TEST_URL','http://127.0.0.1:8080/')
OUT=ROOT/'docs'/'validation-current'/'failures'; OUT.mkdir(parents=True,exist_ok=True)
SESSION={"sessionId":"mock-session","csrf":"mock-csrf","expiresAt":4102444800000,"contractEnabled":True,"voiceEnabled":True}
CV={"provider":"openai","model":"fixture","spec":{"version":1,"title":"Left-side Covenant","zone":"left","speed":"slow","reflection":"normal","price":"reinforcements","line":"Fixture counteroffer.","rationale":"MOCK fixture."},"requestId":"fixture-request","intentVersion":1}

def open_covenant(page):
    page.goto(BASE); page.click('#first-contact'); page.click('#cv-open-connection');page.check('#cv-consent');page.select_option('#cv-mode','server');page.click('#cv-connection-done')

def run_case(browser,name,session_mode='ok',covenant_mode='ok',deny_mic=False,openai_fixture=False):
    context=browser.new_context(viewport={"width":390,"height":844})
    page=context.new_page(); requests=[]
    if deny_mic:
        page.add_init_script("Object.defineProperty(navigator.mediaDevices,'getUserMedia',{value:async()=>{throw new DOMException('Permission denied','NotAllowedError')}})")
    def route_handler(route):
        url=route.request.url; requests.append(url)
        if url.endswith('/api/session'):
            if session_mode=='disconnect': route.abort(); return
            route.fulfill(status=200,content_type='application/json',body=json.dumps(SESSION)); return
        if url.endswith('/api/covenant') and route.request.method=='POST':
            if covenant_mode=='429': route.fulfill(status=429,body='{}'); return
            if covenant_mode=='503': route.fulfill(status=503,body='{}'); return
            body = dict(CV)
            if openai_fixture:
                body['provider'] = 'openai'
                body['reason'] = 'OPENAI fixture response'
            route.fulfill(status=200,content_type='application/json',body=json.dumps(body)); return
        route.continue_()
    page.route('**/api/**',route_handler)
    result={"name":name,"mock":True,"requests":requests}
    try:
        open_covenant(page)
        if deny_mic:
            page.wait_for_function("!document.querySelector('#cv-voice-start').disabled",timeout=4000)
            page.click('#cv-voice-start'); page.wait_for_timeout(250)
            result['voiceState']=page.inner_text('#cv-voice-state')
            assert 'ERROR' in result['voiceState'] or 'DENIED' in result['voiceState']
        else:
            page.click('#cv-propose'); page.wait_for_function("!document.querySelector('#cv-sign').disabled",timeout=5000)
            result['status']=page.inner_text('#cv-status'); result['provider']=page.inner_text('#cv-provider')
            if openai_fixture:
                assert 'OPENAI' in (result['status']+' '+result['provider']).upper()
            else:
                assert 'LOCAL RULES' in (result['status']+' '+result['provider']).upper()
            assert page.locator('#cv-sign').is_enabled()
            page.click('#cv-sign'); page.wait_for_function("document.querySelector('#covenant-screen').hidden===true",timeout=3000)
            result['signedAndEnteredCombat']=True
            if openai_fixture:
                result['mockOpenAIProposalSigned'] = True
                assert page.locator('#covenant-live').is_visible()
                assert page.inner_text('#pact-name').strip()
                snapshot=json.loads(page.evaluate('render_game_to_text()'))
                assert snapshot['liveVoice']['status']=='not-used',snapshot
                assert snapshot['liveVoice']['signedContracts']==0
                result['textSignDidNotClaimVoice']=True
    finally:
        page.screenshot(path=str(OUT/f'{name}.png')); context.close()
    return result

with sync_playwright() as pw:
    browser_path=os.environ.get('NEMESIS_BROWSER')
    kwargs={"headless":True}
    if browser_path: kwargs['executable_path']=browser_path
    browser=pw.chromium.launch(**kwargs)
    results=[run_case(browser,'mock-openai-sign',openai_fixture=True),run_case(browser,'session-disconnect',session_mode='disconnect'),run_case(browser,'upstream-429',covenant_mode='429'),run_case(browser,'service-503',covenant_mode='503'),run_case(browser,'microphone-denied',deny_mic=True)]
    browser_version=browser.version
    browser.close()
report={"mode":"MOCK ONLY","base":BASE,"browser":browser_version,"realApiCalls":0,"results":results}
(OUT/'results.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report,indent=2))
