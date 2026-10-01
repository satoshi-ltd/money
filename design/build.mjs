#!/usr/bin/env node
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './src/draw.mjs';
import { renderPages } from './src/views.mjs';

const pages = renderPages();

if (process.argv.includes('--json')) {
  process.stdout.write(JSON.stringify(pages));
} else {
  const dir = join(ROOT, 'design');
  mkdirSync(dir, { recursive: true });
  for (const [name, html] of Object.entries(pages)) writeFileSync(join(dir, name), html);
  copyFileSync(join(ROOT, 'assets', 'favicon.png'), join(dir, 'favicon.png'));
  console.log(`design/: ${Object.keys(pages).join(', ')}`);
}
