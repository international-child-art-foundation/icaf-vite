import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const debugFlagsPath = path.join(
  repoRoot,
  'frontend/src/shared/debugFlags.ts',
);
const source = readFileSync(debugFlagsPath, 'utf8');
const flagsMatch = source.match(
  /export\s+const\s+debugFlags\s*=\s*\{(?<body>[\s\S]*?)\}\s+as\s+const/,
);

if (!flagsMatch?.groups?.body) {
  console.error(`Could not find debugFlags in ${debugFlagsPath}`);
  process.exit(1);
}

const enabledFlags = [];

for (const line of flagsMatch.groups.body.split('\n')) {
  const match = line.match(/^\s*(?<name>[A-Za-z0-9_]+)\s*:\s*true\s*,?/);
  if (match?.groups?.name) {
    enabledFlags.push(match.groups.name);
  }
}

if (enabledFlags.length > 0) {
  console.error('Debug flags must be false before deploy:');
  for (const flag of enabledFlags) {
    console.error(`- ${flag}`);
  }
  console.error(`Set them to false in ${path.relative(repoRoot, debugFlagsPath)}.`);
  process.exit(1);
}

console.log('Debug flags are disabled.');
