"""Production LOCAL RULES regression through ordinary controls, no API or time mocks."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json, time, os

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/validation-current/production-local'
OUT.mkdir(parents=True, exist_ok=True)

def state(page):
    return json.loads(page.evaluate('()=>render_game_to_text()'))

with sync_playwright() as pw:
    browser = pw.chromium.launch(executable_path=r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe', headless=True)
    page = browser.new_page(viewport={'width': 1280, 'height': 800})
    errors, api = [], []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('request', lambda r: api.append(r.url) if '/api/' in r.url else None)
    report = {'checkedAt': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()), 'browser': browser.version, 'url': os.environ.get('NEMESIS_TEST_URL','https://nemesis-pact-live.vercel.app'), 'automated': True, 'mode': 'LOCAL RULES', 'realModelCalls': 0, 'controlledTime': False, 'physicalPhone': False}
    try:
        page.goto(report['url'], wait_until='networkidle')
        page.click('#first-contact')
        page.click('#cv-open-connection')
        page.select_option('#cv-mode', 'local')
        page.click('#cv-connection-done')
        page.fill('#cv-prompt', '左、いや右を安全に。弾を遅くして、増援は許可。')
        page.click('#cv-propose')
        page.wait_for_function('()=>!document.querySelector("#cv-sign").disabled')
        proposal = state(page)
        assert proposal['revision'] == 0 and proposal['proposal']['spec']['zone'] == 'right'
        assert proposal['proposal']['provider'] == 'local-rules'
        page.screenshot(path=str(OUT / '01-right-correction.png'))
        page.click('#cv-sign')
        page.wait_for_function('()=>JSON.parse(render_game_to_text()).seconds>=8.1')
        page.keyboard.press('KeyR')
        page.wait_for_function('()=>JSON.parse(render_game_to_text()).phase==="parley"')
        before = state(page)
        page.fill('#cv-prompt', '結界はなし。弾を遅く、反射を強く。通常射撃を弱くしていい')
        page.click('#cv-propose')
        page.wait_for_function('()=>!document.querySelector("#cv-sign").disabled')
        amended = state(page)
        spec = amended['proposal']['spec']
        assert (spec['zone'], spec['speed'], spec['reflection'], spec['price']) == ('none', 'slow', 'charged', 'weaker_gun')
        assert amended['seconds'] == before['seconds'] and amended['player']['hp'] == before['player']['hp']
        assert amended['enemies'] == before['enemies'] and amended['spec'] == before['spec']
        page.screenshot(path=str(OUT / '02-unsigned-amendment.png'))
        page.click('#cv-sign')
        page.wait_for_function('()=>JSON.parse(render_game_to_text()).revision===2')
        after = state(page)
        assert after['spec'] == spec and after['player']['hp'] == before['player']['hp']
        assert before['seconds'] <= after['seconds'] < before['seconds'] + 0.6
        assert after['effects']['amendments'] == 1
        assert after['liveVoice']['status'] == 'not-used'
        assert not errors and not api
        report.update({'passed': True, 'before': before, 'after': after, 'checks': ['latest direction wins before Sign', 'explicit no-sanctuary amendment with slow bullets and charged reflection', 'unsigned amendment preserves current fight', 'explicit revision 2 preserves HP and elapsed combat time', 'local signs do not claim live voice']})
    except Exception as error:
        report.update({'passed': False, 'error': str(error)})
        page.screenshot(path=str(OUT / 'failure.png'))
    finally:
        report.update({'errors': errors, 'apiRequests': api})
        (OUT / 'result.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
        print(json.dumps({k: report.get(k) for k in ['passed', 'checks', 'error', 'errors', 'apiRequests']}))
        browser.close()
    if not report['passed']:
        raise SystemExit(1)
