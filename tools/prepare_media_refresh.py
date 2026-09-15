"""Inspect the new continuous source and make a full-length Resolve-compatible copy.

This performs no editorial cuts. Run only after the dated capture succeeds.
"""
from pathlib import Path
import hashlib
import json
import re
import statistics
import subprocess

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/validation-media-refresh-20260915/full-campaign'
ART = ROOT / '.artifacts/media-refresh-20260915'
FF = ROOT / '.work/browser-venv/Lib/site-packages/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe'
SOURCE = ART / 'NEMESIS-PACT-latest-full-campaign-original.webm'
DEST = ART / 'resolve/NEMESIS-PACT-latest-full-campaign-60fps.mp4'
LOG = ROOT / '.work/media-refresh-conversion.log'


def sha256(path):
    with path.open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()


def main():
    capture = json.loads((OUT / 'result.json').read_text('utf-8'))
    assert capture['success'], 'Preserve failed capture; do not represent it as a completed run.'
    assert SOURCE.exists() and FF.exists()
    DEST.parent.mkdir(parents=True, exist_ok=True)
    command = [str(FF), '-n', '-i', str(SOURCE), '-map', '0:v:0', '-map', '0:a:0',
               '-vf', 'showinfo,fps=60', '-c:v', 'libx264', '-preset', 'fast', '-crf', '18',
               '-pix_fmt', 'yuv420p', '-threads', '8', '-c:a', 'aac', '-b:a', '192k',
               '-ar', '48000', '-movflags', '+faststart', str(DEST)]
    with LOG.open('w', encoding='utf-8') as log:
        subprocess.run(command, stdout=log, stderr=subprocess.STDOUT, check=True)
    text = LOG.read_text('utf-8')
    points = [(int(n), float(t), int(w), int(h)) for n, t, w, h in re.findall(
        r' n:\s*(\d+) pts:.*?pts_time:([\d.]+).*? s:(\d+)x(\d+)', text)]
    assert points and {p[2:] for p in points} == {(1920, 1080)}, 'Unstable source dimensions'
    gaps = [b[1] - a[1] for a, b in zip(points, points[1:])]
    report = {'sourceFile': SOURCE.name, 'sourceBytes': SOURCE.stat().st_size,
              'sourceSha256': sha256(SOURCE), 'decodedFrames': len(points),
              'firstTimestamp': points[0][1], 'lastTimestamp': points[-1][1],
              'deliveredAverageFps': round((len(points)-1)/(points[-1][1]-points[0][1]), 4),
              'dimensions': list(points[0][2:]), 'timestampGapMedianSeconds': statistics.median(gaps),
              'timestampGapMaxSeconds': max(gaps), 'gapsOver50ms': sum(d > .05 for d in gaps),
              'compatibilityFile': DEST.name, 'compatibilityBytes': DEST.stat().st_size,
              'compatibilitySha256': sha256(DEST), 'decodeExit': 0,
              'conversion': 'Full-length H264/AAC CFR60 compatibility copy. No cuts or generated motion. Missing source frames are duplicated.'}
    (OUT / 'source-media.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(report), flush=True)


if __name__ == '__main__':
    main()
