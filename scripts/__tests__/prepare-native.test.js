import { spawnSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const SCRIPT = path.join(__dirname, '..', 'prepare-native.cjs');

const settings = (version) =>
  `pluginManagement { includeBuild("shared") }\nplugins { id("org.gradle.toolchains.foojay-resolver-convention").version("${version}") }\n`;

const fixture = (content) => {
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'money-gradle-')), 'settings.gradle.kts');
  fs.writeFileSync(file, content);
  return file;
};

const prepare = (file) => spawnSync(process.execPath, [SCRIPT, file], { encoding: 'utf8' });

describe('prepare-native', () => {
  test('moves the Foojay resolver from 0.5.0 to 1.0.0', () => {
    const file = fixture(settings('0.5.0'));

    expect(prepare(file).status).toBe(0);
    expect(fs.readFileSync(file, 'utf8')).toBe(settings('1.0.0'));
  });

  test('leaves an already patched file untouched', () => {
    const file = fixture(settings('1.0.0'));
    const before = fs.statSync(file).mtimeMs;

    expect(prepare(file).status).toBe(0);
    expect(fs.statSync(file).mtimeMs).toBe(before);
    expect(fs.readFileSync(file, 'utf8')).toBe(settings('1.0.0'));
  });

  test('succeeds when the file is missing', () => {
    const result = prepare(path.join(os.tmpdir(), 'money-gradle-missing', 'settings.gradle.kts'));

    expect(result.status).toBe(0);
    expect(result.stderr).toBe('');
  });

  test('patches the installed gradle plugin', () => {
    const file = path.join(
      path.dirname(require.resolve('@react-native/gradle-plugin/package.json')),
      'settings.gradle.kts',
    );

    expect(spawnSync(process.execPath, [SCRIPT], { encoding: 'utf8' }).status).toBe(0);
    expect(fs.readFileSync(file, 'utf8')).not.toContain('foojay-resolver-convention").version("0.5.0")');
  });
});
