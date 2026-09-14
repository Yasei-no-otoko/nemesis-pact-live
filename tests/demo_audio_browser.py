"""Native Edge validation for the local demo recorder audio graph.

This is intentionally synthetic: three borrowed WebAudio streams (440/880/1320 Hz)
are mixed by the real DemoRecorder and real Sound recording tap. getDisplayMedia is
stubbed only to provide a canvas video track and a decoy 1760 Hz display audio track;
the recorder is still driven by the browser's MediaRecorder implementation.
"""
from __future__ import annotations

import base64
import json
import os
import subprocess
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import sys
import time
from pathlib import Path

import numpy as np
from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "validation-current" / "recorder-audio"
MEDIA = ROOT / ".work" / "recorder-audio"
PYTHON = ROOT / ".work" / "browser-venv" / "Scripts" / "python.exe"
EDGE = Path(r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe")
FFMPEG = ROOT / ".work" / "browser-venv" / "Lib" / "site-packages" / "imageio_ffmpeg" / "binaries" / "ffmpeg-win-x86_64-v7.1.exe"


PAGE_SCRIPT = r"""
(() => {
  const result = {requested: null, downloads: [], tracks: {}, sessions: []};
  const AC = window.AudioContext || window.webkitAudioContext;
  const makeTone = (hz, label, gainValue = 0.18) => {
    const ctx = new AC({sampleRate: 48000});
    const osc = ctx.createOscillator(), gain = ctx.createGain(), dst = ctx.createMediaStreamDestination();
    osc.frequency.value = hz; osc.type = 'sine'; gain.gain.value = gainValue;
    osc.connect(gain); gain.connect(dst); osc.start(); ctx.resume();
    return {ctx, osc, gain, stream: dst.stream, label};
  };
  const mic = makeTone(440, 'mic');
  const remote = makeTone(880, 'remote', 0.22);
  const displays = [];
  const makeDisplay = () => { const displayAudio = makeTone(1760, 'display-decoy', 0.45); const canvas = document.createElement('canvas'); canvas.width = 640; canvas.height = 360; const c = canvas.getContext('2d'); c.fillStyle = '#162033'; c.fillRect(0, 0, 640, 360); c.fillStyle = '#8de4ff'; c.font = '32px sans-serif'; c.fillText('NEMESIS PACT audio validation', 30, 190); const video = canvas.captureStream(30); const display = new MediaStream([...video.getVideoTracks(), ...displayAudio.stream.getAudioTracks()]); displays.push({display, video, displayAudio}); return displays.at(-1); };
  navigator.mediaDevices.getDisplayMedia = async (opts) => { result.requested = opts; return makeDisplay().display; };
  const element = document.createElement('audio'); element.volume = 0.8; element.muted = false;
  const sound = new PactSound({manual: true}); sound.attach(new AC({sampleRate: 48000}));
  const gameOsc = sound.ctx.createOscillator(), gameGain = sound.ctx.createGain();
  gameOsc.frequency.value = 1320; gameGain.gain.value = 0.24; gameOsc.connect(gameGain); gameGain.connect(sound.sfxGain); gameOsc.start(); sound.ctx.resume();
  let lastTap;
  const provider = () => { lastTap = sound.createRecordingTap(); return lastTap; };
  const rec = new NemesisDemo.DemoRecorder({
    navigator, MediaRecorder, MediaStream, AudioContext: AC,
    document, URL, onDownload: async ({blob}) => result.downloads.push(await blob.arrayBuffer().then(b => btoa(String.fromCharCode(...new Uint8Array(b)))))
  });
  rec.attachVoice(mic.stream, 'input'); rec.attachVoice(remote.stream, 'output', {element}); rec.registerGameAudio(provider);
  const live = s => Object.fromEntries(['mic','remote','game','displayVideo','displayAudio','tap'].map((k) => [k, s[k]?.getTracks?.().map(t => t.readyState) || []]));
  window.__audioValidation = {result, rec, sound, mic, remote, displays, element, gameOsc, lastTapRef: () => lastTap, live};
})();
"""


DRIVER = r"""
async () => {
  await new Promise(r => setTimeout(r, 250));
  const v = window.__audioValidation, r = v.result;
  const start = async () => { const ok = await v.rec.start(); if (!ok) throw Error('start failed: '+v.rec.state); return ok; };
  await start();
  await new Promise(x => setTimeout(x, 2400));
  const pre = v.element.volume;
  v.element.volume = 0.23; await new Promise(x => setTimeout(x, 500));
  const loweredGain = v.rec.voiceOutputGain?.gain.value;
  v.element.muted = true; await new Promise(x => setTimeout(x, 350));
  const mutedGain = v.rec.voiceOutputGain?.gain.value;
  v.element.muted = false; await new Promise(x => setTimeout(x, 450));
  const resumedGain = v.rec.voiceOutputGain?.gain.value;
  r.sessions.push({name:'first', volumeBefore: pre, volumeAfter: v.element.volume, loweredGain, mutedGain, resumedGain});
  v.rec.stop('user'); while (v.rec.state !== 'stopped') await new Promise(x => setTimeout(x, 100));
  const borrowedAfterFirst = {mic:v.mic.stream.getAudioTracks().map(t=>t.readyState), remote:v.remote.stream.getAudioTracks().map(t=>t.readyState), game:v.sound.ctx.state, tap:v.lastTapRef()?.stream.getAudioTracks().map(t=>t.readyState)};
  await start();
  const restartGain = v.rec.voiceOutputGain?.gain.value;
  await new Promise(x => setTimeout(x, 2600));
  v.rec.stop('user'); while (v.rec.state !== 'stopped') await new Promise(x => setTimeout(x, 100));
  r.sessions.push({name:'restart', currentVolume:v.element.volume, gainAtStart:restartGain});
  r.tracks.after = {mic:v.mic.stream.getAudioTracks().map(t=>t.readyState), remote:v.remote.stream.getAudioTracks().map(t=>t.readyState), game:v.sound.ctx.state, tap:v.lastTapRef()?.stream.getAudioTracks().map(t=>t.readyState), displays:v.displays.map(d=>({video:d.video.getVideoTracks().map(t=>t.readyState),audio:d.displayAudio.stream.getAudioTracks().map(t=>t.readyState)}))};
  return r;
}
"""


def fft_amplitude(raw: bytes, start: float, duration: float = .4) -> dict:
    wav = MEDIA / "decoded.wav"
    proc = subprocess.run([str(FFMPEG), "-y", "-i", "pipe:0", "-ac", "1", "-ar", "48000", str(wav)], input=raw, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if proc.returncode:
        raise RuntimeError(proc.stderr.decode(errors="replace")[-1200:])
    import wave
    with wave.open(str(wav), "rb") as f:
        samples = np.frombuffer(f.readframes(f.getnframes()), dtype=np.int16).astype(np.float32)
        rate = f.getframerate()
    peaks = {}
    for hz in (440, 880, 1320, 1760):
        # Average a few one-second windows to avoid encoder start/stop padding.
        vals = []
        seg = samples[int(start*rate):int((start+duration)*rate)]
        if len(seg) >= rate // 4:
            freqs = np.fft.rfftfreq(len(seg), 1 / rate); spec = np.abs(np.fft.rfft(seg * np.hanning(len(seg))))
            vals.append(float(spec[np.argmin(abs(freqs - hz))]))
        peaks[str(hz)] = round(max(vals) if vals else 0.0, 2)
    return peaks


def dominant_peaks(raw: bytes) -> dict:
    return fft_amplitude(raw, 1.0, 1.0)


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True); MEDIA.mkdir(parents=True, exist_ok=True)
    html = '<!doctype html><meta charset="utf-8"><title>audio validation</title><script>' + (ROOT / "src" / "score.js").read_text(encoding="utf-8") + '</script><script>' + (ROOT / "src" / "audio.js").read_text(encoding="utf-8") + '</script><script>' + (ROOT / "src" / "demo.js").read_text(encoding="utf-8") + '</script>'
    class Handler(BaseHTTPRequestHandler):
        def do_GET(self):
            if self.path.split('?', 1)[0] != '/': self.send_response(404); self.end_headers(); return
            data = html.encode(); self.send_response(200); self.send_header('Content-Type','text/html'); self.send_header('Content-Length', str(len(data))); self.end_headers(); self.wfile.write(data)
        def log_message(self, *_): pass
    http = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
    threading.Thread(target=http.serve_forever, daemon=True).start()
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True, executable_path=str(EDGE), args=["--autoplay-policy=no-user-gesture-required"])
            page = browser.new_page()
            external = []
            page_errors = []
            page.on("pageerror", lambda err: page_errors.append(str(err)))
            page.on("request", lambda req: external.append(req.url) if not req.url.startswith("http://127.0.0.1:") else None)
            page.route("**/*", lambda route: route.abort() if not route.request.url.startswith("http://127.0.0.1:") else route.continue_())
            page.goto(f"http://127.0.0.1:{http.server_port}/?demo=1", wait_until="domcontentloaded")
            page.evaluate(PAGE_SCRIPT)
            evidence = page.evaluate(DRIVER)
            # MediaRecorder's blob.arrayBuffer callback is asynchronous; wait for both
            # real stop events to have delivered their WebM blobs before collecting them.
            page.wait_for_function("window.__audioValidation.result.downloads.length === 2")
            evidence = page.evaluate("window.__audioValidation.result")
            raw_files = []
            for i, encoded in enumerate(evidence["downloads"], 1):
                raw = base64.b64decode(encoded); path = MEDIA / f"session-{i}.webm"; path.write_bytes(raw); raw_files.append(path)
            evidence["media"] = [{"file": str(p.relative_to(ROOT)), "bytes": p.stat().st_size, "peaks": dominant_peaks(p.read_bytes())} for p in raw_files]
            first_raw, second_raw = raw_files
            windows = {"initial": fft_amplitude(first_raw.read_bytes(), 1.0, .4), "lower": fft_amplitude(first_raw.read_bytes(), 2.45, .3), "mute": fft_amplitude(first_raw.read_bytes(), 2.95, .3), "restored": fft_amplitude(first_raw.read_bytes(), 3.2, .3), "restart": fft_amplitude(second_raw.read_bytes(), 1.0, .4)}
            evidence["browser"] = {"version": browser.version, "automation": "synthetic", "realAPI": False, "externalRequests": external, "pageErrors": page_errors}
            evidence["fftWindows"] = windows
            evidence["checks"] = {"display_audio_requested_false": evidence["requested"]["audio"] is False, "new_display_each_start": len(evidence["tracks"]["after"]["displays"]) == 2, "decoy_1760_absent": all(m["peaks"]["1760"] < 0.005*m["peaks"]["440"] for m in evidence["media"]), "required_tones_present": all(m["peaks"][k] > 1000 for m in evidence["media"] for k in ("440","880","1320")), "remote_volume_mute_path": windows["initial"]["880"] > .2*windows["initial"]["440"] and windows["lower"]["880"] > .01*windows["lower"]["440"] and windows["mute"]["880"] < .005*windows["mute"]["440"] and windows["restored"]["880"] > .01*windows["restored"]["440"], "restart_preserved_remote_volume": abs(evidence["sessions"][1]["gainAtStart"] - evidence["sessions"][1]["currentVolume"]) < .01, "borrowed_live_capture_owned_ended": evidence["tracks"]["after"]["mic"] == ["live"] and evidence["tracks"]["after"]["remote"] == ["live"] and evidence["tracks"]["after"]["game"] != "closed" and evidence["tracks"]["after"]["tap"] == ["ended"] and all(d["video"] == ["ended"] and d["audio"] == ["ended"] for d in evidence["tracks"]["after"]["displays"]), "video_in_both_webm": all(subprocess.run([str(FFMPEG),'-i',str(p)],capture_output=True).stderr.find(b'Video:') >= 0 for p in raw_files), "no_external_requests": not external, "no_page_errors": not page_errors}
            evidence.pop("downloads", None)
            (OUT / "demo-audio-browser.json").write_text(json.dumps(evidence, indent=2), encoding="utf-8")
            print(json.dumps(evidence, indent=2))
            browser.close()
            return 0 if all(evidence["checks"].values()) else 1
    finally:
        http.shutdown(); http.server_close()


if __name__ == "__main__":
    raise SystemExit(main())
