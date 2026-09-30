import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const ROOT = path.join(__dirname, '..', '..');
const SCRIPT = path.join(ROOT, 'scripts', 'design.mjs');
const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');
const dirs = (dir) =>
  fs
    .readdirSync(path.join(ROOT, dir), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== '__tests__')
    .map((entry) => entry.name);

let pages;
beforeAll(() => {
  const result = spawnSync(process.execPath, [SCRIPT, '--json'], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(result.stderr);
  pages = JSON.parse(result.stdout);
});

describe('design kit', () => {
  test('the pages on disk are exactly what the sources render (run `yarn design` after a visible change)', () => {
    for (const [name, html] of Object.entries(pages)) expect(read(`design/${name}`)).toBe(html);
  });

  test('tokens.css carries every colour of both themes, from src/theme/theme.js', () => {
    const css = pages['tokens.css'];
    const source = read('src/theme/theme.js');
    const light = source.slice(source.indexOf('light: {'), source.indexOf('dark: {'));
    for (const key of [...light.matchAll(/^\s{6}(\w+): '(#[0-9A-Fa-f]{6}|rgba\([^)]*\))',$/gm)].map((m) => m[1])) {
      const token = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      expect(css).toContain(`--color-${token}:`);
    }
    expect(css).toContain(':root.dark');
    expect(css).toContain('--font-mono');
  });

  test('the System page shows every primitive and every component the app has', () => {
    const html = pages['index.html'];
    for (const name of [...dirs('src/primitives'), ...dirs('src/components')]) {
      expect(html).toContain(`data-component="${name}"`);
    }
  });

  test('the Mobile page shows every screen the app has', () => {
    const html = pages['mobile.html'];
    for (const name of dirs('src/screens')) expect(html).toContain(`data-screen="${name}"`);
  });

  test('the Open work page lists every open task of the roadmap', () => {
    const html = pages['proposals.html'];
    const roadmap = read('ROADMAP.md');
    const lanes = roadmap.slice(roadmap.indexOf('\n## Queue'));
    const ids = [...lanes.matchAll(/^- \*\*([A-Z][A-Z0-9-]+)\*\* — /gm)].map((m) => m[1]);
    expect(ids.length).toBeGreaterThan(5);
    for (const id of ids) expect(html).toContain(`data-task="${id}"`);
  });

  test('every review board is filed as a roadmap task', () => {
    const html = pages['proposals.html'];
    const boards = [...html.matchAll(/data-review="([A-Z0-9-]+)"/g)].map((m) => m[1]);
    expect(boards).toHaveLength((html.match(/data-review=/g) || []).length);
    for (const id of boards) expect(html).toContain(`data-task="${id}"`);
  });

  test('every page links the others and offers the dark theme', () => {
    for (const name of ['index.html', 'mobile.html', 'proposals.html']) {
      const html = pages[name];
      for (const href of ['index.html', 'mobile.html', 'proposals.html']) expect(html).toContain(`href="${href}"`);
      expect(html).toContain('data-kit-theme="dark"');
      expect(html).not.toContain('desktop.html');
    }
  });
});
