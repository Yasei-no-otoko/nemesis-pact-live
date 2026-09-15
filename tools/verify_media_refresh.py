"""Verify the native 60 fps media-refresh export and its Resolve compatibility cut.

This is an offline verifier. It never launches a browser, calls a model, or writes
over source media. Audio checks use short seeks around each planned cut.
"""
from pathlib import Path
import hashlib
import json
import re
import subprocess
import sys

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / '.artifacts/media-refresh-20260915'
NATIVE = ART / 'NEMESIS-PACT-latest-59s-60fps-en.mp4'
COMPAT = ART / 'resolve/NEMESIS-PACT-latest-full-campaign-60fps.mp4'
PLAN = ROOT / 'docs/validation-media-refresh-20260915/full-campaign/edit-plan.json'
OUT = ROOT / 'docs/validation-media-refresh-20260915/film'
FF = ROOT / '.work/browser-venv/Lib/site-packages/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe'
DECODE_LOG = ROOT / '.work/media-refresh-native-decode.txt'


def fail(message):
    raise SystemExit(message)


def sha(path):
    h = hashlib.sha256()
    with path.open('rb') as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b''):
            h.update(block)
    return h.hexdigest()


def run(args, **kwargs):
    return subprocess.run([str(FF), *map(str, args)], check=True, **kwargs)


def probe(path):
    result = subprocess.run([str(FF), '-hide_banner', '-i', str(path)], text=True,
                            stdout=subprocess.PIPE, stderr=subprocess.STDOUT, check=False)
    text = result.stdout
    video = re.search(r'Video:.*?(\d{2,5})x(\d{2,5})', text)
    rate = re.search(r'(\d+(?:\.\d+)?) fps', text)
    audio = re.search(r'Audio:.*?(\d+) Hz, (stereo|mono)', text)
    duration = re.search(r'Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)', text)
    return {'probeExit': result.returncode, 'width': int(video.group(1)) if video else None,
            'height': int(video.group(2)) if video else None,
            'fps': float(rate.group(1)) if rate else None,
            'audioSampleRate': int(audio.group(1)) if audio else None,
            'audioChannels': 2 if audio and audio.group(2) == 'stereo' else 1 if audio else None,
            'containerSeconds': (int(duration.group(1)) * 3600 + int(duration.group(2)) * 60 + float(duration.group(3))) if duration else None}


def decode_timestamps(path):
    with DECODE_LOG.open('w', encoding='utf-8') as log:
        result = subprocess.run([str(FF), '-hide_banner', '-i', str(path), '-vf', 'showinfo', '-f', 'null', '-'],
                                stdout=log, stderr=subprocess.STDOUT, check=False)
    text = DECODE_LOG.read_text(encoding='utf-8', errors='replace')
    points = [float(value) for value in re.findall(r' n:\s*\d+ pts:.*?pts_time:([\d.]+)', text)]
    dimensions = {(int(w), int(h)) for w, h in re.findall(r' n:\s*\d+ pts:.*? s:(\d+)x(\d+)', text)}
    return result.returncode, points, dimensions


def pcm(path, start, duration):
    data = subprocess.check_output([str(FF), '-hide_banner', '-loglevel', 'error', '-ss', f'{max(0, start):.6f}',
                                    '-t', f'{max(0.05, duration):.6f}', '-i', str(path), '-vn', '-ac', '1', '-ar', '8000',
                                    '-f', 'f32le', 'pipe:1'])
    return np.frombuffer(data, dtype='<f4')


def audio_match(source, native, source_start, native_start, duration):
    window = min(1.4, max(0.25, duration))
    ss = source_start + max(0, (duration - window) / 2)
    ns = native_start + max(0, (duration - window) / 2)
    a, b = pcm(source, ss, window), pcm(native, ns, window)
    n = min(len(a), len(b)); a, b = a[:n], b[:n]
    rms_a, rms_b = float(np.sqrt(np.mean(a * a))), float(np.sqrt(np.mean(b * b)))
    silent = max(rms_a, rms_b) < 0.001
    best, lag = 0.0, 0
    if not silent and n:
        aa = a - np.mean(a); bb = b - np.mean(b)
        denom = np.linalg.norm(aa) * np.linalg.norm(bb)
        if denom:
            for shift in range(-320, 321):
                if shift < 0: x, y = aa[-shift:], bb[:n + shift]
                elif shift > 0: x, y = aa[:n - shift], bb[shift:]
                else: x, y = aa, bb
                if len(x) and len(y):
                    corr = float(np.dot(x, y) / (np.linalg.norm(x) * np.linalg.norm(y) or 1))
                    if corr > best: best, lag = corr, shift
    return {'sourceStart': source_start, 'nativeStart': native_start, 'windowSeconds': window,
            'sourceRms': rms_a, 'nativeRms': rms_b, 'nearSilent': silent,
            'normalizedCorrelation': best, 'lagMs': lag / 8.0,
            'passed': silent or (best >= .98 and abs(lag / 8.0) <= 15)}


def main():
    if not FF.exists(): fail(f'ffmpeg not found: {FF}')
    for path in (NATIVE, COMPAT, PLAN):
        if not path.exists(): fail(f'missing input: {path}')
    if (OUT / 'result.json').exists(): fail('refusing to overwrite existing film result.json')
    OUT.mkdir(parents=True, exist_ok=True)
    plan = json.loads(PLAN.read_text(encoding='utf-8'))
    clips = plan.get('clips', [])
    if not clips: fail('edit plan has no clips')
    native_info = probe(NATIVE); compat_info = probe(COMPAT)
    decode_exit, points, dimensions = decode_timestamps(NATIVE)
    timestamp_error = max((abs(t - i / 60) for i, t in enumerate(points)), default=float('inf'))
    if decode_exit != 0 or len(points) != 3540 or timestamp_error >= .001: fail('native decode/timestamps failed')
    if (native_info['width'], native_info['height']) != (1920, 1080) or dimensions != {(1920, 1080)}: fail('native dimensions drifted')
    if native_info['audioSampleRate'] != 48000 or native_info['audioChannels'] != 2 or native_info['containerSeconds'] is None or native_info['containerSeconds'] > 60: fail('native audio layout or container duration drifted')
    native_audio = pcm(NATIVE, 0, 59)
    native_rms = float(np.sqrt(np.mean(native_audio * native_audio)))
    if not np.isfinite(native_audio).all() or native_rms <= .005: fail('native audio is silent or non-finite')
    screenshots = []
    for i, clip in enumerate(clips, 1):
        target = OUT / f'cut-{i:02}.png'
        if target.exists(): fail(f'refusing to overwrite {target}')
        midpoint = (clip['recordOffset'] + clip['frames'] / 2) / 60
        run(['-hide_banner', '-loglevel', 'error', '-n', '-ss', midpoint, '-i', NATIVE, '-frames:v', 1, target])
        pixels = np.asarray(Image.open(target).convert('RGB'))
        caption_rows = pixels[995:1065, 200:1720]
        bright_caption_pixels = int(np.all(caption_rows > 190, axis=2).sum())
        if bright_caption_pixels < 500:
            fail(f'caption margin absent in {target.name}; inspect native composition output')
        screenshots.append({'file': target.name, 'timeSeconds': midpoint,
                            'brightCaptionPixels': bright_caption_pixels})
    matches = []
    for clip in clips:
        duration = clip['frames'] / 60
        matches.append(audio_match(COMPAT, NATIVE, clip['sourceInFrame'] / 60, clip['recordOffset'] / 60, duration))
    (OUT / 'audio-sync.json').write_text(json.dumps({'clips': matches, 'passed': all(item['passed'] for item in matches)}, indent=2), encoding='utf-8')
    if any(not item['passed'] for item in matches): fail('audible cut audio correlation or lag failed; see audio-sync.json')
    source_info = json.loads((PLAN.parent / 'source-media.json').read_text(encoding='utf-8'))
    report = {'native': {'file': NATIVE.name, 'bytes': NATIVE.stat().st_size, 'sha256': sha(NATIVE), **native_info,
                         'frames': len(points), 'videoSeconds': len(points) / 60, 'decodeExit': decode_exit,
                         'timestampErrorSeconds': timestamp_error, 'audioRms': native_rms,
                         'audioFinite': bool(np.isfinite(native_audio).all()), 'allDecodedFrameDimensions': [list(x) for x in sorted(dimensions)]},
              'compatibility': {'file': COMPAT.name, 'bytes': COMPAT.stat().st_size, 'sha256': sha(COMPAT), **compat_info,
                                'originalDeliveredAverageFps': source_info['deliveredAverageFps'],
                                'originalGapsOver50ms': source_info['gapsOver50ms'],
                                'note': 'Full-length CFR60 conversion duplicates source frames where necessary; it does not invent missing motion.'},
              'clips': matches, 'QAFrames': screenshots, 'cutCount': len(clips),
              'allAudibleCutComparisonsPassed': True, 'filmValidationPassed': True}
    (OUT / 'audio-sync.json').write_text(json.dumps({'clips': matches, 'passed': True}, indent=2), encoding='utf-8')
    (OUT / 'result.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps(report, indent=2))


if __name__ == '__main__':
    main()
