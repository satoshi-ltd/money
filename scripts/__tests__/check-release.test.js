import { spawnSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const SCRIPT = path.join(__dirname, '..', 'check-release.mjs');

const manifests = ({
  version = '3.0.54',
  appVersion = version,
  versionCode = 30,
  buildNumber = '30',
  changelog = `# Changelog\n\n## ${version} — 2026-09-16\n\n- Something happened.\n`,
} = {}) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'money-release-'));
  fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({ version }));
  fs.writeFileSync(
    path.join(root, 'app.json'),
    JSON.stringify({ expo: { version: appVersion, android: { versionCode }, ios: { buildNumber } } }),
  );
  if (changelog !== null) fs.writeFileSync(path.join(root, 'changelog.md'), changelog);
  return root;
};

const check = (...args) => spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8' });

describe('check-release', () => {
  test('passes when package.json, app.json and both build numbers agree', () => {
    const result = check(manifests());

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('v3.0.54, build 30');
  });

  test('fails when app.json lags package.json', () => {
    const result = check(manifests({ appVersion: '3.0.53' }));

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('3.0.54');
    expect(result.stderr).toContain('3.0.53');
  });

  test('fails when android.versionCode and ios.buildNumber disagree', () => {
    const result = check(manifests({ versionCode: 31 }));

    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/versionCode 31 .*buildNumber 30/);
  });

  test('rejects a version that is not x.y.z', () => {
    const result = check(manifests({ version: '3.0.54-beta.1' }));

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('x.y.z');
  });

  test('the repository manifests agree', () => {
    const result = check();

    expect(result.stderr).toBe('');
    expect(result.status).toBe(0);
  });

  test('fails when the release is not written down in the changelog', () => {
    const result = check(manifests({ changelog: '# Changelog\n\n## 3.0.53 — 2026-09-15\n\n- Older.\n' }));

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('3.0.54');
  });

  test('fails when there is no changelog at all', () => {
    const result = check(manifests({ changelog: null }));

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('changelog.md');
  });
});
