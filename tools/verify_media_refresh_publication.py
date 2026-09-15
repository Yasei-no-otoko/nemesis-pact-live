"""Verify anonymously downloaded release and gallery bytes after publication."""
from pathlib import Path
import hashlib
import json
import re
import subprocess
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
    is_html = expected_path.suffix == '.html'
    body = bytearray()
    with urllib.request.urlopen(request, timeout=60) as response:
        status, content_type = response.status, response.headers.get('Content-Type')
        for chunk in iter(lambda: response.read(1024 * 1024), b''):
            digest.update(chunk)
            count += len(chunk)
            if is_html:
                body.extend(chunk)
    expected_bytes = expected_path.read_bytes()
    if expected_path.suffix in {'.html', '.json'}:
        # GitHub Pages publishes committed LF bytes, not a Windows CRLF checkout.
        relative = expected_path.relative_to(ROOT).as_posix()
        expected_bytes = subprocess.run(['git', 'show', f'HEAD:{relative}'], cwd=ROOT,
                                        check=True, capture_output=True).stdout
        assert expected_bytes.replace(b'\r\n', b'\n') == expected_path.read_bytes().replace(b'\r\n', b'\n')
    expected = hashlib.sha256(expected_bytes).hexdigest()
    verified_hash = digest.hexdigest()
    host_scripts = []
    if is_html:
        # The custom-domain host adds this observed analytics tag. Remove only
        # that tag for source comparison; retain the received hash and tag hash.
        pattern = rb'<script type="module" src="https://static\.cloudflareinsights\.com/beacon\.min\.js/[^"\r\n]+" integrity="sha512-[^"\r\n]+" data-cf-beacon=\'[^\'\r\n]*\' crossorigin="anonymous"></script>\n'
        host_scripts = re.findall(pattern, bytes(body))
        assert len(host_scripts) <= 1, 'Unexpected host script multiplicity'
        verified_hash = hashlib.sha256(re.sub(pattern, b'', bytes(body))).hexdigest()
    assert status == 200 and verified_hash == expected, f'Published source bytes differ: {url}'
    return {'url': url, 'status': status, 'contentType': content_type, 'bytes': count,
            'sha256': digest.hexdigest(), 'expectedSourceSha256': expected,
            'matchesSourceBytes': digest.hexdigest() == expected,
            'verifiedSourceSha256': verified_hash, 'matchesSourceAfterDocumentedHostInjection': True,
            'hostAddedAnalyticsScriptSha256': [hashlib.sha256(s).hexdigest() for s in host_scripts]}


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
              'exactSourceByteMatches': sum(x['matchesSourceBytes'] for x in checked),
              'allVerifiedSourceHashesMatch': True,
              'htmlHostDifference': 'One Cloudflare analytics script is added by the custom-domain host. Its hash and the unmodified response hash are retained. All remaining HTML must equal committed source bytes exactly.',
              'browserPlayback': 'Recorded separately in publication-browser.json'}
    OUT.write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'assets': len(checked), 'exactSourceByteMatches': report['exactSourceByteMatches'],
                      'allVerifiedSourceHashesMatch': True, 'productionHtmlSha256': game_hash}))


if __name__ == '__main__':
    main()
