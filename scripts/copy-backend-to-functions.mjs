import { cp, rm, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const root = path.resolve(__dirname, '..');
const backendDist = path.join(root, 'backend', 'dist');
const destSub = process.argv[2] === 'src' ? 'src' : 'lib';
const functionsBase = path.join(root, 'functions', destSub);
const target = path.join(functionsBase, 'backendDist');

async function main() {
  try {
    await rm(target, { recursive: true, force: true });
    await mkdir(target, { recursive: true });
    await cp(backendDist, target, { recursive: true });
    console.log(`Copied backend dist from ${backendDist} to ${target}`);
  } catch (err) {
    console.error('Failed to copy backend dist into functions:', err);
    process.exit(1);
  }
}

main();
