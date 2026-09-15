"""Package the exact filmed application revision without credentials or local media."""
from pathlib import Path
import hashlib
import json
import subprocess
import zipfile

ROOT = Path(__file__).resolve().parents[1]
REVISION = '795e39efe609fe188646ed354268b560ea432486'
OUT = ROOT / '.artifacts/media-refresh-20260915/NEMESIS-PACT-latest-source.zip'
EXACT = {'.env.example', '.gitignore', '.vercelignore', 'package.json', 'package-lock.json',
         'vercel.json', 'index.html', 'THIRD_PARTY_NOTICES.md', 'tools/build.js',
         'tools/serve.js', 'dist/NEMESIS-PACT.html'}
PREFIXES = ('src/', 'server/', 'api/', 'shaders/', 'tests/')


def git(*args):
    return subprocess.check_output(['git', *args], cwd=ROOT)


def main():
    names = git('ls-tree', '-r', '--name-only', '-z', REVISION).decode('utf-8').split('\0')
    files = sorted(n for n in names if n and (n in EXACT or n.startswith(PREFIXES)))
    manifest = {'sourceCommit': REVISION, 'scope': 'Exact filmed application revision, source and tests only', 'files': []}
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(OUT, 'x', zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for name in files:
            body = git('show', f'{REVISION}:{name}')
            archive.writestr(name, body)
            manifest['files'].append({'file': name, 'bytes': len(body), 'sha256': hashlib.sha256(body).hexdigest()})
        readme = git('show', f'{REVISION}:docs/PUBLIC-SOURCE-README.md')
        archive.writestr('README.md', readme)
        archive.writestr('SOURCE-MANIFEST.json', json.dumps(manifest, indent=2) + '\n')
    with zipfile.ZipFile(OUT) as archive:
        assert archive.testzip() is None
        assert all(not n.startswith(('.work/', '.vercel/', '.git/', '.artifacts/')) for n in archive.namelist())
        assert all(not n.startswith('.env') or n == '.env.example' for n in archive.namelist())
    report = {'file': OUT.name, 'bytes': OUT.stat().st_size, 'sha256': hashlib.sha256(OUT.read_bytes()).hexdigest(),
              'sourceCommit': REVISION, 'sourceFiles': len(files), 'zipIntegrity': 'passed', 'public': False}
    (ROOT / 'docs/validation-media-refresh-20260915/source-package.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(report))


if __name__ == '__main__':
    main()
