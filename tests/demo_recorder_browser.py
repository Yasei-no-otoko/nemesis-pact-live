"""Real Edge MediaRecorder, synthetic screen/audio, no model calls."""
from pathlib import Path
import argparse, json, time
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser()
parser.add_argument('--url',default='http://127.0.0.1:8080/?demo=1')
parser.add_argument('--output',default=str(root/'.work/manual-recorder.webm'))
parser.add_argument('--seconds',type=int,default=65)
parser.add_argument('--report',default=str(root/'docs/validation-current/manual-recorder/local'))
args=parser.parse_args();out=Path(args.report);out.mkdir(parents=True,exist_ok=True)
with sync_playwright() as pw:
 b=pw.chromium.launch(channel='msedge',headless=True,args=['--autoplay-policy=no-user-gesture-required'])
 c=b.new_context(accept_downloads=True,viewport={'width':1280,'height':800})
 requests=[]
 c.route('**/api/**',lambda r:(requests.append(r.request.url.split('/api/')[1]),r.abort()))
 p=c.new_page();errors=[];p.on('pageerror',lambda e:errors.append(str(e)));p.goto(args.url)
 p.evaluate("""()=>{
  window.fixture={captures:[]};
  navigator.mediaDevices.getDisplayMedia=async options=>{
   fixture.options=options;const canvas=document.createElement('canvas');canvas.width=1280;canvas.height=720;
   const g=canvas.getContext('2d');const stream=canvas.captureStream(60);fixture.captures.push(stream);
   let n=0;const draw=()=>{g.fillStyle='#142d38';g.fillRect(0,0,1280,720);g.fillStyle='#ddfff3';g.font='40px sans-serif';g.fillText('SYNTHETIC RECORDER QA - NOT GAMEPLAY',40,120);g.fillText('Frame '+n+++' / '+new Date().toISOString(),40,190);if(stream.getVideoTracks()[0].readyState==='live')requestAnimationFrame(draw)};draw();return stream;
  };
  fixture.ac=new AudioContext();fixture.osc=fixture.ac.createOscillator();fixture.dest=fixture.ac.createMediaStreamDestination();
  fixture.osc.connect(fixture.dest);fixture.osc.start();NemesisDemo.attachVoice(fixture.dest.stream,'input');
 }""")
 start=time.monotonic();p.click('#demo-record');p.wait_for_function("NemesisDemo.state==='recording'")
 settings=p.evaluate('(()=>{const s=fixture.captures[0].getVideoTracks()[0].getSettings();return {request:fixture.options,actual:{frameRate:s.frameRate,width:s.width,height:s.height},mime:NemesisDemo.recorder.mimeType}})()')
 for _ in range(args.seconds):p.wait_for_timeout(1000)
 elapsed=p.evaluate('NemesisDemo.elapsedMs');assert elapsed>=(args.seconds-1)*1000
 assert p.evaluate("NemesisDemo.recorder.state==='recording'")
 p.screenshot(path=str(out/'recording.png'))
 with p.expect_download() as downloaded:p.click('#demo-record')
 downloaded.value.save_as(args.output);p.wait_for_function("NemesisDemo.state==='stopped'")
 first_closed=p.evaluate("fixture.captures[0].getTracks().every(t=>t.readyState==='ended')")
 mic_live=p.evaluate("fixture.dest.stream.getAudioTracks().every(t=>t.readyState==='live')")
 p.click('#demo-record');p.wait_for_timeout(700)
 with p.expect_download() as again:p.click('#demo-record')
 again.value.save_as(str(Path(args.output).with_name('manual-recorder-restart.webm')))
 p.wait_for_function("NemesisDemo.state==='stopped'")
 closed=p.evaluate("fixture.captures.every(s=>s.getTracks().every(t=>t.readyState==='ended')) && NemesisDemo.audioContext===null && NemesisDemo.recordStream===null")
 p.screenshot(path=str(out/'saved.png'))
 report={'recordingState':p.evaluate('NemesisDemo.state'),'fileBytes':Path(args.output).stat().st_size,'recordingElapsedMs':elapsed,'wallSecondsIncludingRestart':round(time.monotonic()-start,2),'requestedSeconds':args.seconds,'manualStop':True,'restartSaved':True,'firstTracksClosed':first_closed,'allCaptureTracksClosed':closed,'gameOwnedMicrophoneNotStoppedByRecorder':mic_live,'apiRequests':requests,'realModelCalls':0,'syntheticCapture':True,'syntheticAudio':True,'humanMicrophone':False,'browser':'Microsoft Edge '+b.version,'os':'Windows','headless':True,'viewport':{'width':1280,'height':800},'settings':settings,'errors':errors,'savedNotice':p.inner_text('#demo-record-help')}
 assert report['recordingState']=='stopped' and closed and first_closed and mic_live and not errors and not requests,report
 p.evaluate('fixture.osc.stop();fixture.dest.stream.getTracks().forEach(t=>t.stop());fixture.ac.close()')
 (out/'result.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report));b.close()
