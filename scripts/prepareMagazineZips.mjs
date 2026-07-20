import { mkdir, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = path.resolve(process.argv[2] ?? path.join(repoRoot, 'delete'));
const outDir = path.resolve(process.argv[3] ?? path.join(repoRoot, '.magazine-zips'));

function runZip(issueDir, outFile) {
  return new Promise((resolve, reject) => {
    const child = spawn('zip', ['-qr', outFile, '.'], {
      cwd: issueDir,
      stdio: 'inherit',
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`zip exited with code ${code}`));
    });
  });
}

const entries = await readdir(sourceDir, { withFileTypes: true });
const issueDirs = entries
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort((a, b) => a.localeCompare(b));

if (issueDirs.length === 0) {
  throw new Error(`No issue folders found in ${sourceDir}`);
}

await mkdir(outDir, { recursive: true });

for (const issue of issueDirs) {
  const issueDir = path.join(sourceDir, issue);
  const outFile = path.join(outDir, `${issue}.zip`);

  await rm(outFile, { force: true });
  console.log(`Packaging ${issue}`);
  await runZip(issueDir, outFile);
}

console.log(`Prepared ${issueDirs.length} magazine zip files in ${outDir}`);
