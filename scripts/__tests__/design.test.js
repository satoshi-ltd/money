import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const ROOT = path.join(__dirname, '..', '..');
const SCRIPT = path.join(ROOT, 'design', 'build.mjs');
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

  test('the Proposals page holds boards only, and every ui task of the roadmap has its board', () => {
    const html = pages['proposals.html'];
    const tasks = [...read('ROADMAP.md').matchAll(/^- \*\*([A-Z][A-Z0-9-]+)\*\* — .*\n\s+`ui · /gm)].map((m) => m[1]);
    const boards = [...html.matchAll(/data-review="([A-Z0-9-]+)"/g)].map((m) => m[1]);

    expect(boards).toHaveLength((html.match(/data-review=/g) || []).length);
    for (const id of tasks) expect(boards).toContain(id);
    expect(html).not.toContain('data-task=');
  });

  test('board IDs are unique, never reuse a task that is not a ui task, and each UI- board is named by the task that keeps its logic', () => {
    const html = pages['proposals.html'];
    const roadmap = read('ROADMAP.md');
    const boards = [...html.matchAll(/data-review="([A-Z0-9-]+)"/g)].map((m) => m[1]);
    const tasks = [...roadmap.matchAll(/^- \*\*([A-Z][A-Z0-9-]+)\*\* — .*\n\s+`(\w+) · /gm)].map((m) => ({ id: m[1], type: m[2] }));
    const named = [...roadmap.replace(/\s+/g, ' ').matchAll(/the interface follows board ([A-Z0-9-]+)/g)].map((m) => m[1]);

    expect(new Set(boards).size).toBe(boards.length);
    for (const { id, type } of tasks) if (type !== 'ui') expect(boards).not.toContain(id);
    for (const id of boards.filter((board) => board.startsWith('UI-'))) expect(named).toContain(id);
    for (const id of named) expect(boards).toContain(id);
    for (const match of html.matchAll(/data-review="[A-Z0-9-]+"[\s\S]*?<b>Accept<\/b> · ([^<]*)</g)) expect(match[1].length).toBeGreaterThan(20);
  });

  test('the month ticks board draws the ticks the app ships, from the dictionaries', () => {
    const html = pages['proposals.html'];

    expect(html).toContain('>mär<');
    expect(html.match(/>jui</g)).toHaveLength(2);
    expect(html).toContain('>juil.<');
  });

  test('every page carries the project icon as a favicon copied inside design/', () => {
    const names = Object.keys(pages).filter((name) => name.endsWith('.html'));

    expect(names).toHaveLength(3);
    for (const name of names) expect(pages[name]).toContain('<link rel="icon" href="favicon.png">');
    const copy = fs.readFileSync(path.join(ROOT, 'design', 'favicon.png'));
    expect(copy.equals(fs.readFileSync(path.join(ROOT, 'assets', 'favicon.png')))).toBe(true);
  });

  test('design/ is self-contained: its own contract, its generator, and no design file left in scripts/', () => {
    if (fs.existsSync(path.join(ROOT, 'design', 'CLAUDE.md'))) expect(read('design/CLAUDE.md')).toBe('@AGENTS.md\n');
    expect(read('design/AGENTS.md')).toContain('# Design kit');
    for (const file of ['build.mjs', 'src/draw.mjs', 'src/views.mjs', 'src/proposals.mjs']) {
      expect(fs.existsSync(path.join(ROOT, 'design', file))).toBe(true);
    }
    expect(JSON.parse(read('package.json')).scripts.design).toBe('node design/build.mjs');
    expect(fs.readdirSync(path.join(ROOT, 'scripts')).filter((name) => /design/i.test(name))).toEqual([]);
  });

  test('every page links the others and offers the dark theme', () => {
    for (const name of ['index.html', 'mobile.html', 'proposals.html']) {
      const html = pages[name];
      for (const href of ['index.html', 'mobile.html', 'proposals.html']) expect(html).toContain(`href="${href}"`);
      expect(html).toContain('data-kit-theme="dark"');
      expect(html).toContain('>Proposals<');
      expect(html).not.toContain('Open work');
      expect(html).not.toContain('desktop.html');
    }
  });
});
