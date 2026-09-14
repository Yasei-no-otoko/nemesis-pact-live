"""Prepare a local source review ZIP; this script never publishes it."""
from pathlib import Path
import hashlib,json,subprocess,zipfile

root=Path(__file__).resolve().parents[1]
tracked=subprocess.check_output(['git','ls-files','-z'],cwd=root).decode().split('\0')
roots=('src/','server/','api/','shaders/','tests/')
exact={'.env.example','.gitignore','.vercelignore','package.json','package-lock.json','vercel.json','index.html','THIRD_PARTY_NOTICES.md','tools/build.js','tools/serve.js','dist/NEMESIS-PACT.html'}
files=sorted(p for p in tracked if p and (p.startswith(roots) or p in exact))
commit=subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip()
out=root/'.artifacts'/'submission';out.mkdir(parents=True,exist_ok=True)
archive=out/f'NEMESIS-PACT-source-review-{commit[:7]}.zip'
manifest={'sourceCommit':commit,'scope':'source review archive; no Git history, secrets, private logs or human footage','files':[]}
with zipfile.ZipFile(archive,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for name in files:
        data=(root/name).read_bytes();z.writestr(name,data)
        manifest['files'].append({'file':name,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
    readme=(root/'docs/PUBLIC-SOURCE-README.md').read_bytes();z.writestr('README.md',readme)
    manifest['files'].append({'file':'README.md','bytes':len(readme),'sha256':hashlib.sha256(readme).hexdigest()})
    z.writestr('SOURCE-MANIFEST.json',json.dumps(manifest,indent=2))
with zipfile.ZipFile(archive) as z:
    assert z.testzip() is None
    assert all(not n.startswith(('.git/','.work/','.vercel/','.artifacts/')) for n in z.namelist())
    assert all(not n.startswith('.env') or n=='.env.example' for n in z.namelist())
report={'file':archive.name,'bytes':archive.stat().st_size,'sha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'files':len(files)+2,'sourceCommit':commit,'public':False}
(out/'source-review-package.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report))
