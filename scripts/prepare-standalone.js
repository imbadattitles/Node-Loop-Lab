import { cpSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const buildRoot = path.join(process.cwd(), '.next');
const staticSource = path.join(buildRoot, 'static');
const staticTarget = path.join(buildRoot, 'standalone', '.next', 'static');

if (!existsSync(staticSource)) {
  throw new Error('Next.js static output is missing; run this after next build');
}

mkdirSync(path.dirname(staticTarget), { recursive: true });
cpSync(staticSource, staticTarget, { recursive: true, force: true });
