import { spawnSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const SCRIPT = path.join(__dirname, '..', 'bump.mjs');

const project = ({ version = '3.0.61', build = 37 } = {}) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'money-bump-'));
  fs.mkdirSync(path.join(root, 'scripts'));
  fs.copyFileSync(SCRIPT, path.join(root, 'scripts/bump.mjs'));
  fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({ version }));
  fs.writeFileSync(
    path.join(root, 'app.json'),
    JSON.stringify({ expo: { version, android: { versionCode: build }, ios: { buildNumber: String(build) } } }),
  );
  fs.writeFileSync(path.join(root, 'CHANGELOG.md'), `# Changelog\n\n## ${version} — 2026-09-21\n\n- Shipped.\n`);
  return root;
};

const bump = (root, ...args) =>
  spawnSync(process.execPath, [path.join(root, 'scripts/bump.mjs'), ...args], { encoding: 'utf8' });
const read = (root, file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));

describe('bump', () => {
  test('a patch moves the version and both build counters together, and opens the changelog entry', () => {
    const root = project();
    const result = bump(root);

    expect(result.status).toBe(0);
    expect(read(root, 'package.json').version).toBe('3.0.62');
    const { expo } = read(root, 'app.json');
    expect(expo.version).toBe('3.0.62');
    expect(expo.android.versionCode).toBe(38);
    expect(expo.ios.buildNumber).toBe('38');
    const changelog = fs.readFileSync(path.join(root, 'CHANGELOG.md'), 'utf8');
    expect(changelog.indexOf('## 3.0.62 —')).toBeLessThan(changelog.indexOf('## 3.0.61 —'));
    expect(result.stdout).toContain('3.0.62, build 38');
  });

  test('minor and major reset the lower parts', () => {
    const minor = project();
    bump(minor, 'minor');
    expect(read(minor, 'package.json').version).toBe('3.1.0');

    const major = project();
    bump(major, 'major');
    expect(read(major, 'package.json').version).toBe('4.0.0');
  });

  test('an unknown step or a malformed version stops before writing', () => {
    const root = project();
    expect(bump(root, 'huge').status).toBe(1);
    expect(read(root, 'package.json').version).toBe('3.0.61');

    const broken = project({ version: 'three' });
    expect(bump(broken).status).toBe(1);
  });

  test('bumping twice into the same version does not open a second entry', () => {
    const root = project();
    bump(root);
    fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({ version: '3.0.61' }));
    bump(root);
    const changelog = fs.readFileSync(path.join(root, 'CHANGELOG.md'), 'utf8');
    expect(changelog.match(/## 3\.0\.62 —/g)).toHaveLength(1);
  });
});
