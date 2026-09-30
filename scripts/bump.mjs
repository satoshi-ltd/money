import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const step = process.argv[2] || 'patch';
const fail = (message) => {
  console.error(message);
  process.exit(1);
};

if (!['patch', 'minor', 'major'].includes(step)) fail('Use bump.mjs [patch|minor|major]');

const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const write = (file, data) => fs.writeFileSync(path.join(root, file), `${JSON.stringify(data, null, 2)}\n`);

const pkg = read('package.json');
const app = read('app.json');
const [major, minor, patch] = pkg.version.split('.').map(Number);
if ([major, minor, patch].some((n) => !Number.isInteger(n))) fail(`Expected an x.y.z version, got ${pkg.version}`);

const version =
  step === 'major' ? `${major + 1}.0.0` : step === 'minor' ? `${major}.${minor + 1}.0` : `${major}.${minor}.${patch + 1}`;
const build = Number(app.expo.android.versionCode) + 1;

pkg.version = version;
app.expo.version = version;
app.expo.android.versionCode = build;
app.expo.ios.buildNumber = String(build);
write('package.json', pkg);
write('app.json', app);

const changelog = path.join(root, 'CHANGELOG.md');
const today = new Date().toISOString().slice(0, 10);
const heading = `## ${version} — ${today}`;
const current = fs.readFileSync(changelog, 'utf8');
if (!current.includes(`## ${version} —`)) {
  fs.writeFileSync(changelog, current.replace('# Changelog\n\n', `# Changelog\n\n${heading}\n\n- \n\n`));
}

console.log(`${version}, build ${build}; write the entry under "${heading}" in CHANGELOG.md`);
