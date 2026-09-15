"""Verify anonymously downloaded release and gallery bytes after publication."""
from pathlib import Path
import hashlib
import json
import urllib.request
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]
SITE = 'https://www.circle-hydrangea.net/nemesis-pact-live/'
RELEASE = 'https://github.com/Yasei-no-otoko/nemesis-pact-live/releases/download/media-refresh-20260915-english-demo/'
ART = ROOT / '.artifacts/media-refresh-20260915'
OUT = ROOT / 'docs/validation-media-refresh-20260915/publication-http.json'


def inspect(url, expected_path):
    request = urllib.request.Request(url, headers={'Cache-Control': 'no-cache', 'User-Agent': 'NEMESIS-media-verification'})
    digest, count = hashlib.sha256(), 0
    with urllib.request.urlopen(request, timeout=60) as response:
        status, content_type = response.status, response.headers.get('Content-Type')
        for chunk in iter(lambda: response.read(1024 * 1024), b''):
            digest.update(chunk)
            count += len(chunk)
    expected = hashlib.sha256(expected_path.read_bytes()).hexdigest()
    assert status == 200 and digest.hexdigest() == expected, f'Published bytes differ: {url}'
    return {'url': url, 'status': status, 'contentType': content_type, 'bytes': count,
            'sha256': digest.hexdigest(), 'matchesLocal': True}


def main():
    assert not OUT.exists(), 'Preserve previous publication evidence'
    gallery = json.loads((ROOT / 'site/demo/gallery-provenance.json').read_text('utf-8'))
    checked = []
    for relative in ['index.html', 'gallery-provenance.json', *[x['file'] for x in gallery['images']]]:
        checked.append(inspect(SITE + relative, ROOT / 'site/demo' / relative))
    for filename in ['NEMESIS-PACT-latest-59s-60fps-en.mp4', 'NEMESIS-PACT-latest-59s-60fps-en.srt', 'NEMESIS-PACT-latest-source.zip']:
        checked.append(inspect(RELEASE + filename, ART / filename))
    with urllib.request.urlopen('https://nemesis-pact-live.vercel.app/', timeout=30) as response:
        game_hash = hashlib.sha256(response.read()).hexdigest()
    assert game_hash == '01c3ead4762f0c97ae8b5602e06fe66cb6f6530bb69f7a91acbcb3982c611340'
    report = {'checkedAt': datetime.now(timezone.utc).isoformat(), 'anonymousDownloads': True,
              'assetCount': len(checked), 'assets': checked, 'productionHtmlSha256': game_hash,
              'allHashesMatch': True, 'browserPlayback': 'Recorded separately in publication-browser.json'}
    OUT.write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'assets': len(checked), 'allHashesMatch': True, 'productionHtmlSha256': game_hash}))


if __name__ == '__main__':
    main()
