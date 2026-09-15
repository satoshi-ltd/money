import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mode = process.argv[2];
const installOnly = process.argv.includes('--install-only');
const fail = (message) => {
  console.error(message);
  process.exit(1);
};

if (!['dev', 'prod'].includes(mode)) fail('Use android-build.mjs dev|prod [--install-only]');
if (installOnly && mode !== 'dev') fail('--install-only is for dev builds');

const sdk =
  process.env.ANDROID_HOME ||
  process.env.ANDROID_SDK_ROOT ||
  (process.platform === 'darwin'
    ? path.join(os.homedir(), 'Library/Android/sdk')
    : path.join(os.homedir(), 'Android/Sdk'));
const java =
  process.env.JAVA_HOME ||
  (process.platform === 'darwin' ? '/Applications/Android Studio.app/Contents/jbr/Contents/Home' : undefined);
const env = { ...process.env, ANDROID_HOME: sdk, ANDROID_SDK_ROOT: sdk, ...(java ? { JAVA_HOME: java } : {}) };

const run = (command, args) => {
  const result = spawnSync(command, args, { cwd: root, env, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
};

if (!fs.existsSync(path.join(root, 'node_modules/expo'))) fail('Run yarn install first');
run(process.execPath, ['scripts/check-release.mjs']);

const { version } = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8')).expo;
const output = path.join(root, 'release-assets', `money-${version}-android${mode === 'dev' ? '-dev' : ''}.apk`);
fs.mkdirSync(path.dirname(output), { recursive: true });

// --local is mandatory: signing credentials come from EAS, compilation never uses a cloud worker.
if (!installOnly) {
  run('npx', [
    '--yes',
    'eas-cli',
    'build',
    '--local',
    '--platform',
    'android',
    '--profile',
    mode === 'dev' ? 'development' : 'production',
    '--output',
    output,
  ]);
}
if (!fs.existsSync(output)) fail(`No APK at ${output}`);
console.log(`APK: ${output}`);

if (mode === 'dev') {
  const adb = path.join(sdk, 'platform-tools/adb');
  const emulator = path.join(sdk, 'emulator/emulator');
  const avd = process.env.MONEY_ANDROID_AVD || 'Pixel_9_Pro_Fold';

  const read = (args) => {
    const result = spawnSync(adb, args, { env, encoding: 'utf8' });
    if (result.error) throw result.error;
    return result.status === 0 ? result.stdout.trim() : '';
  };
  const device = () =>
    read(['devices'])
      .split('\n')
      .map((line) => line.split(/\s+/)[0])
      .find((id) => id.startsWith('emulator-') && read(['-s', id, 'emu', 'avd', 'name']).split(/\r?\n/)[0] === avd);
  const booted = (serial) => read(['-s', serial, 'shell', 'getprop', 'sys.boot_completed']) === '1';

  let serial = device();
  if (!serial) {
    const available = spawnSync(emulator, ['-list-avds'], { env, encoding: 'utf8' });
    if (!available.stdout?.split(/\r?\n/).includes(avd)) fail(`Emulator not found: ${avd}`);
    const child = spawn(emulator, ['-avd', avd], { env, detached: true, stdio: 'ignore' });
    child.on('error', (error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
    child.unref();
  }

  const deadline = Date.now() + 180000;
  while (Date.now() < deadline) {
    serial = device();
    if (serial && booted(serial)) break;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  if (!serial || !booted(serial)) fail('Emulator did not boot within 3 minutes');

  // Never uninstall or clear user data to work around a signing/version mismatch.
  run(adb, ['-s', serial, 'install', '-r', output]);
  run(adb, ['-s', serial, 'reverse', 'tcp:8081', 'tcp:8081']);
  run(adb, ['-s', serial, 'shell', 'am', 'start', '-n', 'com.satoshilimited.money/.MainActivity']);
  console.log(`Installed on ${avd}. Metro remains user-managed: yarn start`);
}
