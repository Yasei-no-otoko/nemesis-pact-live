"""Covenant desktop geometry, modal accessibility and ordinary-control regression.
No model calls. Optional NEMESIS_TEST_URL can verify the deployed build.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json,os,time,traceback
ROOT=Path(__file__).resolve().parents[1]
OUT=Path(os.environ.get('NEMESIS_LAYOUT_OUT',ROOT/'docs/validation-current/compact-covenant'));OUT.mkdir(parents=True,exist_ok=True)
URL=os.environ.get('NEMESIS_TEST_URL','http://127.0.0.1:8080/')
def state(p):return json.loads(p.evaluate('()=>render_game_to_text()'))
def geometry(p):
 return p.evaluate('''()=>{const screen=document.querySelector('#covenant-screen');return {scrollHeight:screen.scrollHeight,clientHeight:screen.clientHeight,scrollTop:screen.scrollTop,controls:Object.fromEntries(['cv-open-connection','cv-close','cv-voice-start','cv-prompt','cv-propose','cv-sign','cv-contract-title','cv-clauses','cv-rule-note','cv-preview','cv-status'].map(id=>{const r=document.getElementById(id).getBoundingClientRect();return [id,{top:r.top,bottom:r.bottom,left:r.left,right:r.right}];})),panels:Object.fromEntries(['.covenant-wrap','.cv-editor','.cv-review','.cv-proposal'].map(q=>{const e=document.querySelector(q);return[q,{height:e.clientHeight,scroll:e.scrollHeight}];}))};}''')
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path=r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',headless=True)
 report={'checkedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'url':URL,'browser':browser.version,'realModelCalls':0,'input':'automated native browser; LOCAL RULES; synthetic long captions only for geometry stress','physicalPhone':False,'results':[]}
 try:
  for width,height,touch in [(1920,1080,False),(1366,768,False),(1280,720,False),(1024,768,False),(960,600,False),(390,844,True),(320,568,True)]:
   context=browser.new_context(viewport={'width':width,'height':height},has_touch=touch,is_mobile=touch)
   p=context.new_page();errors=[];requests=[];p.on('pageerror',lambda e:errors.append(str(e)));p.on('request',lambda r:requests.append(r.url) if '/api/' in r.url else None)
   try:
    p.goto(URL,wait_until='networkidle');p.click('#first-contact');p.click('#cv-open-connection')
    assert p.locator('#cv-connection-dialog').is_visible()
    p.select_option('#cv-mode','local');p.click('#cv-use-local')
    assert not p.locator('#cv-connection-dialog').is_visible()
    assert state(p)['phase']=='covenant'
    p.fill('#cv-prompt','左、いや右を安全に。弾を遅くして、増援は許可。');p.click('#cv-propose');p.wait_for_function('()=>!document.querySelector("#cv-sign").disabled')
    assert state(p)['proposal']['spec']['zone']=='right';assert state(p)['revision']==0
    normal=geometry(p)
    if not touch:
     assert normal['scrollHeight']<=normal['clientHeight']+1,normal
     for name,r in normal['controls'].items():assert 0<=r['top']<r['bottom']<=height+1 and 0<=r['left']<r['right']<=width+1,(name,r)
     assert all(x['scroll']<=x['height']+1 for x in normal['panels'].values()),normal
    p.screenshot(path=str(OUT/f'deal-{width}x{height}.png'))
    p.click('#cv-open-connection');before=state(p)
    p.locator('#cv-connection-done').focus();p.keyboard.press('Tab')
    assert p.locator('#cv-connection-close').evaluate('(e)=>e===document.activeElement')
    p.keyboard.press('Shift+Tab')
    assert p.locator('#cv-connection-done').evaluate('(e)=>e===document.activeElement')
    p.evaluate('''()=>{window.layoutPad={connected:true,buttons:Array.from({length:16},()=>({pressed:false})),axes:[0,0,0,0]};Object.defineProperty(navigator,'getGamepads',{value:()=>[layoutPad],configurable:true});layoutPad.buttons[13].pressed=true;}''')
    p.wait_for_function('()=>document.activeElement.id==="cv-connection-close"')
    p.evaluate('()=>{layoutPad.buttons[13].pressed=false;}')
    if not touch:
     assert p.locator('#cv-connection-dialog').evaluate('(e)=>e.scrollHeight<=e.clientHeight+1')
     assert p.locator('#cv-connection-dialog').evaluate('(e)=>{const r=e.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight&&r.left>=0&&r.right<=innerWidth;}')
    p.screenshot(path=str(OUT/f'consent-{width}x{height}.png'))
    p.keyboard.press('Escape');assert not p.locator('#cv-connection-dialog').is_visible();assert state(p)['phase']==before['phase'] and state(p)['proposal']==before['proposal']
    assert p.locator('#cv-open-connection').evaluate('(e)=>e===document.activeElement')
    p.click('#cv-review-details');assert p.locator('#cv-detail-content').inner_text();p.keyboard.press('Escape');assert p.locator('#cv-sign').is_enabled()
    if not touch:
     p.evaluate('''()=>{document.querySelector('#cv-caption-player').textContent='左ではなく右を安全にして弾を遅くして増援は許可。'.repeat(16).slice(0,400);document.querySelector('#cv-caption-notary').textContent='The new covenant protects the right side with slower bullets. '.repeat(6).slice(0,300);document.querySelector('#cv-contract-title').textContent='A completely revised sanctuary and reflection pact'.slice(0,48);document.querySelector('#cv-line').textContent='I will honor your revised covenant with a safe place to fight and slower enemy bullets, if you accept the stated price and sign the contract before we resume.';}''')
     stress=geometry(p);assert stress['scrollHeight']<=stress['clientHeight']+1,stress
     assert all(x['scroll']<=x['height']+1 for x in stress['panels'].values()),stress
     p.screenshot(path=str(OUT/f'long-captions-{width}x{height}.png'))
     p.click('#cv-transcript');assert len(p.locator('#cv-detail-content').inner_text())>600;p.keyboard.press('Escape')
     p.evaluate('''()=>{document.querySelector('#cv-contract-title').textContent='契約'.repeat(24);document.querySelector('#cv-line').textContent='これは契約を変更するときに表示される長い対話の文章です。'.repeat(12).slice(0,240);}''')
     maximum=geometry(p);assert all(x['scroll']<=x['height']+1 for x in maximum['panels'].values()),maximum
     full_line=p.locator('#cv-line').inner_text();p.screenshot(path=str(OUT/f'max-japanese-prose-{width}x{height}.png'))
     p.click('#cv-review-details');assert full_line in p.locator('#cv-detail-content').inner_text();p.keyboard.press('Escape')
     p.fill('#cv-prompt','右を安全に。弾を遅くして増援は許可。');p.click('#cv-propose')
    p.click('#cv-sign');p.wait_for_function('()=>JSON.parse(render_game_to_text()).phase==="combat"')
    assert state(p)['revision']==1;assert state(p)['spec']['zone']=='right'
    assert not errors and not requests,(errors,requests)
    report['results'].append({'viewport':[width,height],'touchEmulation':touch,'passed':True,'geometry':normal,'modalEscapePreservedProposal':True,'modalFocusTrapped':True,'signedRevision':1,'renderer':state(p)['renderer']})
   except Exception as e:
    p.screenshot(path=str(OUT/f'failure-{width}x{height}.png'));report['results'].append({'viewport':[width,height],'passed':False,'error':traceback.format_exc(),'errors':errors});raise
   finally:context.close()
  report['passed']=True
 except Exception as e:report.update(passed=False,error=str(e))
 finally:
  browser.close();(OUT/'result.json').write_text(json.dumps(report,indent=2),encoding='utf8');print(json.dumps(report))
 if not report['passed']:raise SystemExit(1)
