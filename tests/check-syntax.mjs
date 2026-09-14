import { readdir } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { spawnSync } from 'node:child_process';
const roots = ['src', 'server', 'api', 'tools'];
const files = [];
async function walk(dir) {
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, item.name);
    if (item.isDirectory()) await walk(path);
    else if (['.js', '.mjs', '.cjs'].includes(extname(item.name))) files.push(path);
  }
}
for (const root of roots) await walk(root);
files.sort();
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) { process.stderr.write(result.stderr); process.exit(result.status || 1); }
}
console.log(`Syntax checked ${files.length} files with ${process.version}`);
