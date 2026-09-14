"""Actual UI callbacks with synthetic transcripts and LOCAL RULES, no paid APIs."""
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_env import launch_kwargs
import json,os,time
ROOT=Path(__file__).resolve().parents[1]
OUT=Path(os.environ.get('NEMESIS_WITHDRAWAL_OUT',ROOT/'docs/validation-current/voice-withdrawal/local'))
OUT.mkdir(parents=True,exist_ok=True)
URL=os.environ.get('NEMESIS_TEST_URL','http://127.0.0.1:8080/')
def state(p):return json.loads(p.evaluate('render_game_to_text()'))
with sync_playwright() as pw:
 b=pw.chromium.launch(**launch_kwargs());c=b.new_context(viewport={'width':1280,'height':800})
 c.add_init_script('''(()=>{let module;Object.defineProperty(window,'PactVoice',{configurable:true,get(){return module;},set(value){const Base=value.PactVoice;module={...value,PactVoice:class extends Base{constructor(options){super(options);window.speechFixture={input:options.onInput,delegate:options.onDelegation};}}};}});})();''')
 p=c.new_page();p.set_default_timeout(18000);errors=[];requests=[]
 p.on('pageerror',lambda e:errors.append(str(e)));p.on('request',lambda r:requests.append(r.url) if '/api/' in r.url else None)
 report={'checkedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'url':URL,'browser':b.version,
  'input':'synthetic transcript callbacks; actual UI and local canonical proposal/sign path','realApi':False,'humanMicrophone':False,'controlledTime':False}
 def heard(delta):p.evaluate('s=>speechFixture.input({delta:s})',delta)
 def delegate():return p.evaluate('()=>speechFixture.delegate()')
 try:
  p.goto(URL,wait_until='networkidle');p.click('#first-contact');p.click('#cv-open-connection');p.select_option('#cv-mode','local');p.click('#cv-use-local')
  p.fill('#cv-prompt','右側を安全にして。増援は許可する。');p.click('#cv-propose');p.click('#cv-sign')
  p.wait_for_function('()=>JSON.parse(render_game_to_text()).seconds>=8.2');p.click('#cv-parley');before=state(p)
  heard('安全は撤回');delegate();assert state(p)['proposal'] is not None,'A single clause was mistaken for whole-proposal cancellation'
  heard('。その代わり敵の弾を遅く');assert p.locator('#cv-sign').is_disabled();delegate()
  amended=state(p);assert amended['proposal'] is not None and amended['proposal']['spec']['speed']=='slow'
  assert p.input_value('#cv-prompt')=='安全は撤回。その代わり敵の弾を遅く'
  assert amended['seconds']==before['seconds'] and amended['player']['hp']==before['player']['hp'] and amended['enemies']==before['enemies']
  p.screenshot(path=str(OUT/'01-clause-removal-proposal.png'))
  heard('。前の提案を撤回して。');delegate()
  assert state(p)['proposal'] is None and state(p)['revision']==1 and p.locator('#cv-sign').is_disabled()
  assert p.input_value('#cv-prompt')=='' and 'Proposal withdrawn' in p.inner_text('#cv-status')
  p.screenshot(path=str(OUT/'02-explicit-proposal-withdrawal.png'))
  heard('やっぱり結界なし。弾を遅くして通常射撃を弱く。');delegate()
  afterContinuation=state(p);assert afterContinuation['proposal'] is not None
  assert '安全は撤回。その代わり敵の弾を遅く' in p.input_value('#cv-prompt'),'Earlier partial speech was discarded'
  assert 'やっぱり結界なし' in p.input_value('#cv-prompt') and afterContinuation['revision']==1
  p.click('#cv-sign');p.wait_for_function('()=>JSON.parse(render_game_to_text()).revision===2');after=state(p)
  assert after['player']['hp']==before['player']['hp'] and before['seconds']<=after['seconds']<before['seconds']+.5
  assert [x['hp'] for x in after['enemies'] if x['type']=='boss']==[x['hp'] for x in before['enemies'] if x['type']=='boss']
  p.screenshot(path=str(OUT/'03-signed-amendment.png'));assert not errors and not requests
  report.update(passed=True,before=before,clauseRemovalProposal=amended['proposal'],after=after,explicitCancellationPassed=True,partialContinuationPreserved=True)
 except Exception as e:
  report.update(passed=False,error=str(e));p.screenshot(path=str(OUT/'failure.png'))
 finally:
  report.update(pageErrors=errors,apiRequests=requests);(OUT/'result.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8');c.close();b.close()
 print(json.dumps({k:report[k] for k in ('passed','error') if k in report}))
 if not report['passed']:raise SystemExit(1)
