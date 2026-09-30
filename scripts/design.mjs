#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, renderPages } from './design-pages.mjs';

const pages = renderPages();

if (process.argv.includes('--json')) {
  process.stdout.write(JSON.stringify(pages));
} else {
  const dir = join(ROOT, 'design');
  mkdirSync(dir, { recursive: true });
  for (const [name, html] of Object.entries(pages)) writeFileSync(join(dir, name), html);
  console.log(`design/: ${Object.keys(pages).join(', ')}`);
}
