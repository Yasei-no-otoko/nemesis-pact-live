"""Actual result UI with legal full-state pilots and fixed simulation time.
No upstream/model calls, no HP/time/rule mutations. Phone sizes are emulation.
"""
from pathlib import Path
from urllib.parse import urlsplit
import hashlib, json, os, sys
from playwright.sync_api import sync_playwright
from browser_env import launch_kwargs
ROOT=Path(__file__).resolve().parents[1]
OUT=Path(os.environ.get('NEMESIS_ENCOUNTER_OUT',ROOT/'docs/validation-v1.0.0/encounter-browser'));OUT.mkdir(parents=True,exist_ok=True)
URL=os.environ.get('NEMESIS_TEST_URL','http://127.0.0.1:8100/?test=1')
PILOT=(ROOT/'tests/simulate.js').read_text(encoding='utf-8').split('function pilot(w) {',1)[1].split('\nfunction play',1)[0]
def state(p):
    return p.evaluate('''()=>{const w=__PACT_TEST__.world,b=w.enemies.find(e=>e.type==='boss');return {phase:w.phase,seed:w.seed,time:w.time,hp:w.p.hp,bossHp:b?.hp,revision:w.revision,parries:w.parries,stats:{...w.covenantStats},report:w.report()}}''')
def sign(p,amend=False):
    if not amend:
        p.click('#cv-open-connection');p.select_option('#cv-mode','local');p.click('#cv-use-local')
    else:p.fill('#cv-prompt','Remove the sanctuary. Slow your fire and amplify reflections. My gun can be weaker.')
    p.click('#cv-propose');p.wait_for_function('()=>!document.querySelector("#cv-sign").disabled');p.click('#cv-sign');p.wait_for_function('()=>__PACT_TEST__.world.phase==="combat"')
def tick(p,n=240,mode='honor'):
    return p.evaluate('''([n,mode])=>{const t=__PACT_TEST__,w=t.world;for(let i=0;i<n&&w.phase==='combat';i++){let x=qaPilot(w);x.breach=mode==='breach';if(mode==='contact'){const b=w.enemies.find(e=>e.type==='boss');x={mx:b?(b.x-w.p.x)/40:0,my:b?(b.y-w.p.y)/40:-1,shoot:true,autoAim:true};}w.step(1/120,x);}t.advance(0);return {phase:w.phase,cue:document.querySelector('#combat-guide').dataset.cue};}''',[n,mode])
def finish(p,mode='honor'):
    cues=set()
    for _ in range(100):
        r=tick(p,240,mode);cues.add(r['cue'])
        if r['phase'] in ('won','dead'):return state(p),sorted(cues)
        if r['phase']=='parley':p.click('#cv-close')
    raise AssertionError('encounter exceeded200simulatedseconds')
def verify_result(p,s,outcome,name):
    e=p.locator('#result');assert e.is_visible();assert e.get_attribute('data-encounter')=='true' and e.get_attribute('data-outcome')==outcome
    values={'shielded':s['stats']['shielded'],'reflected':s['stats']['reflectedDamage'],'signed':len(s['report']['receipts']),'seconds':s['time'],'hull':s['hp'],'parries':s['parries']}
    for k,v in values.items():
        el=p.locator(f'#result-stats [data-result-metric="{k}"]');assert abs(float(el.get_attribute('data-value'))-v)<1e-8
    terms=p.evaluate('()=>PactCovenant.describe(__PACT_TEST__.world.spec)');text=p.locator('#result-rules').inner_text()
    assert all(t in text for t in [terms['title'],terms['price'],*terms['benefits']]) and 'LOCAL RULES' in text
    assert p.evaluate('()=>{const e=document.querySelector("#result");return e.scrollWidth<=e.clientWidth+1}')
    memory=p.evaluate('()=>localStorage.getItem("nemesis.covenant.memory.v1")');p.evaluate('()=>__PACT_TEST__.results()');assert memory==p.evaluate('()=>localStorage.getItem("nemesis.covenant.memory.v1")')
    p.screenshot(path=str(OUT/f'{name}-{outcome}.png'));p.locator('#retry').scroll_into_view_if_needed();p.screenshot(path=str(OUT/f'{name}-{outcome}-actions.png'))
def run(p,name,mobile):
    p.goto(URL,wait_until='domcontentloaded');p.wait_for_timeout(700);p.evaluate('()=>{const segmentHit=PactCore.segmentHit;window.qaPilot=function(w){'+PILOT+'}')
    p.click('#first-contact');sign(p);assert p.locator('#touch-context-hint' if mobile else '#combat-guide').is_visible();assert p.locator('#cv-parley').is_disabled()
    p.click('#pause-btn');assert 'more seconds' in p.locator('#pause-parley').inner_text();p.click('#pause-help');assert p.locator('#covenant-help').is_visible();assert 'automatic' in p.locator('#covenant-help').inner_text();p.screenshot(path=str(OUT/f'{name}-help.png'));p.click('#help-close');p.click('#resume')
    tick(p,960);assert not p.locator('#cv-parley').is_disabled();p.click('#cv-parley');before=state(p);sign(p,True);after=state(p)
    assert before['hp']==after['hp'] and before['bossHp']==after['bossHp'] and before['time']==after['time'] and after['revision']==2
    assert after['report']['rules']['zone']=='none' and after['report']['rules']['reflection']=='charged' and after['report']['rules']['price']=='weaker_gun'
    assert p.locator('#cv-parley').is_disabled() and 'USED' in p.locator('#cv-parley').inner_text();p.click('#pause-btn');assert 'already used' in p.locator('#pause-parley').inner_text();p.click('#resume')
    hon,cues=finish(p);assert hon['phase']=='won';verify_result(p,hon,'honored',name)
    seed=hon['seed'];memory=hon['report']['memoryAfter'];p.click('#retry');assert state(p)['seed']==seed and state(p)['report']['memoryBefore']==memory
    sign(p);unbound,_=finish(p,'breach');assert unbound['phase']=='won';verify_result(p,unbound,'unbound',name)
    p.click('#retry');sign(p);lost,_=finish(p,'contact');assert lost['phase']=='dead';verify_result(p,lost,'lost',name)
    p.click('#result-campaign');assert p.locator('#hangar').is_visible()
    return {'checks':['context guidance and help','waiting/used amendment reasons','two visible signatures and exact continuity','honored/unbound/lost actual metrics and canonical rules','repeat results does not double-save memory','retry seed and memory','full campaign entry','no result horizontal overflow; phone actions reachable'],'cuesObserved':cues,'continuity':{'before':before,'after':after},'honored':hon,'unbound':unbound,'lost':lost}
with sync_playwright() as pw:
    b=pw.chromium.launch(**launch_kwargs(headless=True),args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']);rows=[]
    for name,w,h,mobile in [('desktop',1280,800,False),('phone',390,844,True),('small',320,568,True)]:
        c=b.new_context(viewport={'width':w,'height':h},has_touch=mobile,is_mobile=mobile,device_scale_factor=1);c.add_init_script('window.__PACT_TEST_MODE__=true;window.requestAnimationFrame=()=>0;');p=c.new_page();p.set_default_timeout(12000);errors=[];external=[]
        p.on('pageerror',lambda e:errors.append(str(e)));p.on('request',lambda r:external.append(r.url) if urlsplit(r.url).scheme in ('http','https','ws','wss') and urlsplit(r.url).netloc!=urlsplit(URL).netloc else None)
        row={'name':name,'viewport':[w,h],'mobileEmulation':mobile,'errors':errors,'externalRequests':external}
        try:row.update(run(p,name,mobile));assert not errors and not external;row['passed']=True;print(name,'PASS',flush=True)
        except Exception as e:row.update({'failure':repr(e),'passed':False,'state':p.evaluate('()=>window.render_game_to_text?.()')});p.screenshot(path=str(OUT/f'{name}-ERROR.png'));print(name,repr(e),flush=True)
        rows.append(row);c.close()
    report={'url':URL,'browser':b.version,'renderer':'WEBGL2 / PBR; ANGLE SwiftShader','method':'Frozen RAF; legal full-state pilot; loss intentionally steers into boss with automatic fire and no defense. No HP/time/phase edits. Real DOM/signing; LOCAL RULES; no model calls. Phone sizes are PC emulation.','htmlSha256':hashlib.sha256((ROOT/'dist/NEMESIS-PACT.html').read_bytes()).hexdigest(),'results':rows}
    (OUT/'results.json').write_text(json.dumps(report,indent=2),encoding='utf-8');b.close()
    if not all(r['passed'] for r in rows):sys.exit(1)
