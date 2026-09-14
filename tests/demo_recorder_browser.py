from pathlib import Path
from playwright.sync_api import sync_playwright
import json, time
root=Path(__file__).resolve().parents[1]
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path=r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',args=['--autoplay-policy=no-user-gesture-required'])
 c=b.new_context(accept_downloads=True);p=c.new_page();errors=[];p.on('pageerror',lambda e:errors.append(str(e)));p.goto('http://localhost:8080/?demo=1')
 p.evaluate('''()=>{navigator.mediaDevices.getDisplayMedia=async()=>{const canvas=document.createElement('canvas');canvas.width=640;canvas.height=360;const g=canvas.getContext('2d');setInterval(()=>{g.fillStyle='#234';g.fillRect(0,0,640,360);g.fillStyle='white';g.font='30px sans-serif';g.fillText('RECORDER FIXTURE '+Date.now(),30,100);},33);return canvas.captureStream(30);};}''')
 start=time.monotonic()
 with p.expect_download(timeout=70000) as d:
  p.click('#demo-record');p.wait_for_timeout(2000)
  assert '58s' in p.inner_text('#demo-record') or '59s' in p.inner_text('#demo-record'),p.inner_text('#demo-record')
  # Attach changing microphone streams after the recorder has already started.
  p.evaluate('''()=>{const ac=new AudioContext();const o=ac.createOscillator();const dest=ac.createMediaStreamDestination();o.connect(dest);o.start();NemesisDemo.attachVoice(dest.stream,'input');}''')
 d.value.save_as(str(root/'.work/demo-fixture.webm'))
 p.wait_for_timeout(200)
 report={'recordingState':p.evaluate('NemesisDemo.state'),'fileBytes':(root/'.work/demo-fixture.webm').stat().st_size,'elapsedSeconds':round(time.monotonic()-start,2),'mockCapture':True,'realVoice':False,'browser':b.version,'errors':errors,'savedNotice':p.inner_text('#demo-record-help')}
 assert report['recordingState']=='stopped' and not errors, report
 out=root/'docs/validation-current/demo-recorder';out.mkdir(parents=True,exist_ok=True);(out/'result.json').write_text(json.dumps(report,indent=2));print(report);b.close()
