import { spawnSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const ROOT = path.join(__dirname, '..', '..');
const SCRIPT = path.join(ROOT, 'site', 'scripts', 'build.mjs');
const VERSION = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version;
const APK = `money-${VERSION}-android.apk`;
const APK_URL = `https://github.com/satoshi-ltd/money/releases/download/v${VERSION}/${APK}`;

const dirs = [];
const tmp = () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'money-site-'));
  dirs.push(dir);
  return dir;
};
const build = (release, extraEnv = {}) => {
  const output = path.join(tmp(), 'dist');
  const env = { ...process.env, SITE_OUTPUT: output, ...extraEnv };
  delete env.RELEASE_JSON;
  delete env.APP_STORE_URL;
  delete env.PLAY_STORE_URL;
  Object.assign(env, extraEnv);
  if (release) {
    env.RELEASE_JSON = path.join(tmp(), 'release.json');
    fs.writeFileSync(env.RELEASE_JSON, JSON.stringify(release));
  }
  const result = spawnSync(process.execPath, [SCRIPT], { encoding: 'utf8', env });
  return { result, output, html: () => fs.readFileSync(path.join(output, 'index.html'), 'utf8') };
};
const published = (url = APK_URL, size = 1000) => ({
  tag_name: `v${VERSION}`,
  draft: false,
  assets: [{ name: APK, size, browser_download_url: url }],
});

afterAll(() => dirs.forEach((dir) => fs.rmSync(dir, { recursive: true, force: true })));

describe('landing site', () => {
  let pending;
  beforeAll(() => {
    pending = build();
    if (pending.result.status !== 0) throw new Error(pending.result.stderr);
  });

  test('carries the package version and the latest changelog entry, with no token left over', () => {
    const html = pending.html();
    expect(html).toContain(`v${VERSION}`);
    expect(html).not.toMatch(/\{\{[A-Z_]+\}\}/);
    const entry = fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8').split(/^## /m)[1].trim().split('\n')[0];
    expect(html).toContain(entry.replace(/&/g, '&amp;'));
  });

  test('every local file the page and its stylesheet name is in the build', () => {
    const html = pending.html();
    const css = fs.readFileSync(path.join(pending.output, 'styles.css'), 'utf8');
    const refs = [
      ...[...html.matchAll(/(?:href|src|srcset)="([^"#?]+)(?:[#?][^"]*)?"/g)].map((m) => m[1]),
      ...[...css.matchAll(/url\("([^"]+)"\)/g)].map((m) => m[1]),
    ].filter((ref) => !/^(https?:|#|mailto:)/.test(ref));
    expect(refs.length).toBeGreaterThan(8);
    for (const ref of refs) expect(fs.existsSync(path.join(pending.output, ref))).toBe(true);
  });

  test('is quiet: two own scripts (theme and the interactive bits), no inline style, and the only other hosts are the stores, the maker and the repository', () => {
    const html = pending.html();
    expect([...html.matchAll(/<script[^>]*>/gi)].map((m) => m[0].replace(/\?v=[0-9a-f]+/, ''))).toEqual([
      '<script src="theme.js">',
      '<script src="interactive.js" defer>',
    ]);
    expect(html).not.toMatch(/<script[^>]*>(?!<\/script>)/i);
    expect(html).not.toMatch(/<style/i);
    expect(html).not.toMatch(/\sstyle=/i);
    const hosts = new Set([...html.matchAll(/https?:\/\/([^/"\s<]+)/g)].map((m) => m[1]));
    expect([...hosts].sort()).toEqual(['apps.apple.com', 'github.com', 'play.google.com', 'www.satoshi-ltd.com']);
    const headers = fs.readFileSync(path.join(pending.output, '_headers'), 'utf8');
    expect(headers).toContain("default-src 'self'");
    expect(headers).toContain("style-src 'self'");
  });

  test('keeps a sticky header with the version and a download link to a real section', () => {
    const css = fs.readFileSync(path.join(pending.output, 'styles.css'), 'utf8');
    const html = pending.html();
    const header = html.split('<header')[1].split('</header>')[0];
    const targets = [...header.matchAll(/href="#([a-z-]+)"/g)].map((m) => m[1]);
    expect(css).toMatch(/\.masthead \{[^}]*position: sticky;[^}]*top: 0;/);
    expect(targets).toHaveLength(1);
    expect(html).toContain(`id="${targets[0]}"`);
    expect(header).toContain('class="nav-cta');
    expect(header).not.toContain('<ul');
  });

  test('follows the system theme until the reader picks one, and remembers the pick', () => {
    const css = fs.readFileSync(path.join(pending.output, 'styles.css'), 'utf8');
    const script = fs.readFileSync(path.join(pending.output, 'theme.js'), 'utf8');
    expect(css).toContain('@media (prefers-color-scheme: dark)');
    expect(css).toContain(':root:not([data-theme="light"])');
    expect(css).toContain(':root[data-theme="dark"]');
    expect(pending.html()).toContain('class="theme-btn"');
    expect(script).toContain('prefers-color-scheme: dark');
    expect(script).toContain("localStorage.setItem('money-theme'");
  });

  test('the month explorer starts on the day the phone shows and speaks the app\'s words within its 5% band', () => {
    const { reading, SPENDS, DAYS } = require('../../site/interactive.js');
    const html = pending.html();
    const start = reading(9);
    expect(start).toMatchObject({ spent: 552.78, usual: 1042.29, direction: 'under', verdict: '47% below pace' });
    expect(html).toContain('552<i>.78</i>');
    expect(html).toContain('1,042<i>.29</i>');
    expect(html).toContain('47% below pace');
    expect(html).toContain('<b data-day>9th</b>');
    expect(reading(1).verdict).toBe('more than usual');
    expect(reading(2).verdict).toBe('less than usual');
    expect(reading(4).verdict).toBe('51% below pace');
    expect(reading(19)).toMatchObject({ direction: 'flat', verdict: 'as usual' });
    expect(reading(11).label).toBe('Usual by the 11th');
    expect(reading(DAYS).spent).toBeCloseTo(SPENDS.reduce((sum, [, amount]) => sum + amount, 0), 2);
    const directions = new Set(Array.from({ length: DAYS }, (_, i) => reading(i + 1).direction));
    expect([...directions].sort()).toEqual(['flat', 'over', 'under']);
  });

  test('versions its stylesheet and scripts by content, so a stale cache cannot pair new markup with old styles', () => {
    const html = pending.html();
    for (const file of ['styles.css', 'theme.js', 'interactive.js']) {
      const hash = require('crypto').createHash('sha1').update(fs.readFileSync(path.join(ROOT, 'site', file))).digest('hex').slice(0, 10);
      expect(html).toContain(`${file}?v=${hash}`);
    }
  });

  test('serves each font with its licence and keeps the focus ring readable on the light ground', () => {
    for (const licence of ['LICENSE.instrument-sans', 'LICENSE.fragment-mono', 'LICENSE.geist-mono']) {
      expect(fs.readFileSync(path.join(pending.output, 'assets', licence), 'utf8')).toContain('SIL Open Font License');
    }
    const css = fs.readFileSync(path.join(pending.output, 'styles.css'), 'utf8');
    expect(css).toContain('outline: 3px solid var(--ink)');
    expect(css).not.toContain('outline: 3px solid var(--accent)');
  });

  test('has no style rule for a class that no markup or script uses', () => {
    const css = fs.readFileSync(path.join(pending.output, 'styles.css'), 'utf8').replace(/url\([^)]*\)/g, '');
    const used = [pending.html(), fs.readFileSync(path.join(pending.output, 'interactive.js'), 'utf8'), fs.readFileSync(SCRIPT, 'utf8')].join('\n');
    const classes = new Set([...css.matchAll(/\.([a-zA-Z_][\w-]*)/g)].map((m) => m[1]));
    const tokens = new Set(used.match(/[\w-]+/g));
    expect([...classes].filter((name) => !tokens.has(name))).toEqual([]);
  });

  test('says thirty currencies because the app has thirty', () => {
    const source = fs.readFileSync(path.join(ROOT, 'src/modules/constants.js'), 'utf8');
    const groups = source.slice(source.indexOf('CURRENCY_GROUPS'), source.indexOf('SYMBOL:'));
    const codes = [...groups.matchAll(/codes: \[([^\]]*)\]/g)].flatMap((m) => m[1].match(/'[A-Z]+'/g));
    expect(codes).toHaveLength(30);
    expect(pending.html()).toContain('30 currencies');
    expect(pending.html()).toContain('Thirty');
  });

  test('links the two store listings, apart from the APK', () => {
    const html = pending.html();
    expect(html).toContain('href="https://apps.apple.com/us/app/m%C3%B4ney/id6738948243"');
    expect(html).toContain('href="https://play.google.com/store/apps/details?id=com.satoshilimited.money"');
    expect(html).not.toContain('Not on the App Store');
    expect((html.match(/class="store"/g) || []).length).toBe(4);
  });

  test('takes other listings from APP_STORE_URL and PLAY_STORE_URL, and only real store ones', () => {
    const custom = build(null, {
      APP_STORE_URL: 'https://apps.apple.com/us/app/money/id1',
      PLAY_STORE_URL: 'https://play.google.com/store/apps/details?id=example.money',
    });
    expect(custom.result.status).toBe(0);
    expect(custom.html()).toContain('href="https://apps.apple.com/us/app/money/id1"');
    expect(custom.html()).toContain('details?id=example.money');
    expect(build(null, { APP_STORE_URL: 'https://example.com/app' }).result.stderr).toContain('Invalid App Store URL');
    expect(build(null, { APP_STORE_URL: 'http://apps.apple.com/app/x' }).result.status).not.toBe(0);
    expect(build(null, { PLAY_STORE_URL: 'https://example.com/store/apps/details?id=x' }).result.stderr).toContain('Invalid Google Play URL');
    expect(build(null, { PLAY_STORE_URL: 'https://play.google.com/store/apps' }).result.status).not.toBe(0);
  });

  test('offers no download until the release holds the APK', () => {
    const html = pending.html();
    expect(html).toContain('link-pending');
    expect(html).not.toContain('/releases/download/');
  });

  test('links the APK of the published release, and only at its own URL', () => {
    const live = build(published());
    expect(live.result.status).toBe(0);
    expect(live.html()).toContain(`href="${APK_URL}"`);
    expect(live.html()).not.toContain('APK not published yet');

    const forged = build(published(`https://example.com/releases/download/v${VERSION}/${APK}`));
    expect(forged.result.status).not.toBe(0);
    expect(forged.result.stderr).toContain('Unexpected release asset URL');
    expect(build(null, { PLAY_STORE_URL: 'https://user:pw@play.google.com/store/apps/details?id=x' }).result.status).not.toBe(0);

    const empty = build(published(APK_URL, 0));
    expect(empty.html()).toContain('link-pending');
  });

  test('shows the version and notes of the published release, not the package version', () => {
    const live = build({ ...published(), tag_name: 'v9.8.7', body: 'Notes <b>of</b> 9.8.7', assets: [{ name: 'money-9.8.7-android.apk', size: 5, browser_download_url: 'https://github.com/satoshi-ltd/money/releases/download/v9.8.7/money-9.8.7-android.apk' }] });
    expect(live.result.status).toBe(0);
    expect(live.html()).toContain('v9.8.7');
    expect(live.html()).toContain('Notes &lt;b&gt;of&lt;/b&gt; 9.8.7');
    expect(live.html()).toContain('/releases/download/v9.8.7/money-9.8.7-android.apk');
    expect(live.html()).not.toContain(`v${VERSION}`);
  });

  test('refuses a draft or a malformed tag, and a metadata file that an explicit RELEASE_JSON names but is missing', () => {
    expect(build({ ...published(), draft: true }).result.status).not.toBe(0);
    expect(build({ ...published(), tag_name: 'latest' }).result.status).not.toBe(0);
    const env = { ...process.env, SITE_OUTPUT: path.join(tmp(), 'dist'), RELEASE_JSON: path.join(tmp(), 'absent.json') };
    const missing = spawnSync(process.execPath, [SCRIPT], { encoding: 'utf8', env });
    expect(missing.status).not.toBe(0);
    expect(missing.stderr).toContain('Published release metadata not found');
    expect(missing.stderr).toContain('yarn site:release');
  });

  test('a release file that says there is none builds the pending page', () => {
    const none = build(null);
    const dir = tmp();
    const file = path.join(dir, 'release.json');
    fs.writeFileSync(file, 'null');
    const output = path.join(tmp(), 'dist');
    const result = spawnSync(process.execPath, [SCRIPT], { encoding: 'utf8', env: { ...process.env, SITE_OUTPUT: output, RELEASE_JSON: file } });
    expect(none.result.status).toBe(0);
    expect(result.status).toBe(0);
    expect(fs.readFileSync(path.join(output, 'index.html'), 'utf8')).toContain('APK not published yet');
  });

  test('a custom SITE_OUTPUT is never emptied by the build', () => {
    const output = path.join(tmp(), 'dist');
    fs.mkdirSync(output, { recursive: true });
    fs.writeFileSync(path.join(output, 'keep.txt'), 'mine');
    const env = { ...process.env, SITE_OUTPUT: output };
    delete env.RELEASE_JSON;
    expect(spawnSync(process.execPath, [SCRIPT], { encoding: 'utf8', env }).status).toBe(0);
    expect(fs.existsSync(path.join(output, 'keep.txt'))).toBe(true);
  });
});

const READER = path.join(ROOT, 'site', 'scripts', 'read-release.mjs');
const readRelease = (releases, { ok = true, repo = 'satoshi-ltd/money' } = {}) => {
  const driver = `
    const { readRelease, selectRelease, resolveToken } = await import(${JSON.stringify(READER)});
    const calls = [];
    const fetch = async (url, init) => { calls.push({ url, auth: init.headers.Authorization }); return { ok: ${ok}, status: ${ok ? 200 : 401}, statusText: ${JSON.stringify(ok ? 'OK' : 'Unauthorized')}, json: async () => ${JSON.stringify(releases)} }; };
    try {
      const release = await readRelease({ repo: ${JSON.stringify(repo)}, token: 't0ken', fetch });
      console.log(JSON.stringify({ release, calls, env: [resolveToken({ GITHUB_TOKEN: 'a' }), resolveToken({ GH_TOKEN: 'g', GITHUB_TOKEN: 'a' })] }));
    } catch (error) { console.log(JSON.stringify({ error: error.message })); }
  `;
  const out = spawnSync(process.execPath, ['--input-type=module', '-e', driver], { encoding: 'utf8' });
  return JSON.parse(out.stdout);
};
const withApk = (version, extra = {}) => ({
  tag_name: `v${version}`,
  draft: false,
  assets: [{ name: `money-${version}-android.apk`, size: 100 }],
  ...extra,
});

describe('release reader', () => {
  test('picks the newest published version that carries its APK, through the GitHub API', () => {
    const answer = readRelease([
      withApk('3.0.9'),
      withApk('3.0.10'),
      withApk('3.1.0', { draft: true }),
      withApk('4.0.0', { tag_name: 'latest' }),
      { tag_name: 'v5.0.0', draft: false, assets: [] },
      withApk('6.0.0', { assets: [{ name: 'money-6.0.0-android.apk', size: 0 }] }),
      withApk('7.0.0', { prerelease: true }),
    ]);
    expect(answer.release.tag_name).toBe('v3.0.10');
    expect(answer.calls[0]).toEqual({
      url: 'https://api.github.com/repos/satoshi-ltd/money/releases?per_page=100',
      auth: 'Bearer t0ken',
    });
    expect(answer.env).toEqual(['a', 'g']);
  });

  test('answers null when no release has the APK yet, and stops on an API error or a bad repository', () => {
    expect(readRelease([]).release).toBeNull();
    expect(readRelease([{ tag_name: 'v1.0.0', draft: false, assets: [] }]).release).toBeNull();
    expect(readRelease([], { ok: false }).error).toContain('401 Unauthorized');
    expect(readRelease([], { repo: 'not a repo' }).error).toContain('Repository is required');
  });
});

describe('site workflow', () => {
  const workflow = fs.readFileSync(path.join(ROOT, '.github', 'workflows', 'publish-site.yml'), 'utf8');
  const build = workflow.slice(workflow.indexOf('  build:'), workflow.indexOf('  deploy:'));
  const deploy = workflow.slice(workflow.indexOf('  deploy:'));

  test('builds from published release metadata with the lockfile, and tests the site first', () => {
    expect(build).toContain('RELEASE_JSON: site/release.json');
    expect(build).toContain('SITE_URL: https://money.satoshi-ltd.com');
    expect(build).toContain('APP_STORE_URL: ${{ vars.APP_STORE_URL }}');
    expect(build).toContain('PLAY_STORE_URL: ${{ vars.PLAY_STORE_URL }}');
    expect(build).toContain('persist-credentials: false');
    const order = ['yarn install --frozen-lockfile --ignore-scripts', 'yarn jest scripts/__tests__/site.test.js', 'yarn site:release', 'yarn site:build', 'upload-artifact'];
    const at = order.map((step) => build.indexOf(step));
    expect(at.every((index) => index > 0)).toBe(true);
    expect([...at].sort((x, y) => x - y)).toEqual(at);
  });

  test('keeps the Cloudflare credentials out of the job that installs the app\'s dependencies', () => {
    expect(build).not.toMatch(/CLOUDFLARE|secrets\./);
    expect(deploy).toContain('test -n "${!key}"');
    expect(deploy).not.toContain('yarn');
    expect(deploy).not.toContain('actions/checkout');
    for (const key of ['CLOUDFLARE_ACCOUNT_ID', 'CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_PAGES_PROJECT_NAME']) {
      expect(deploy).toContain(key);
    }
  });

  test('uploads the built page with a pinned Wrangler to its own Pages project', () => {
    expect(deploy).toMatch(/wrangler@4\.\d+\.\d+ pages deploy site-dist --project-name="\$CLOUDFLARE_PAGES_PROJECT_NAME" --branch=main/);
    expect(deploy).toContain('needs: build');
    expect(build).toContain('name: site-dist');
    expect(build).toContain('path: site/dist/');
    expect(deploy).toContain('name: site-dist');
    expect(deploy).toContain('path: site-dist');
  });

  test('runs only from a published release that is not a prerelease, or a manual run on main, with read-only permissions', () => {
    expect(workflow).toContain('types: [published]');
    expect(workflow).toContain("github.event_name == 'workflow_dispatch' && github.ref == 'refs/heads/main'");
    expect(workflow).toContain("github.event_name == 'release' && !github.event.release.prerelease");
    expect(workflow).toMatch(/^permissions:\n  contents: read$/m);
    expect(workflow).toContain('group: money-site');
    expect(workflow).toContain('cancel-in-progress: false');
  });

  test('does not run on pushes or pull requests, so an unconfigured Cloudflare never turns a push red', () => {
    expect(workflow).not.toMatch(/^\s+push:/m);
    expect(workflow).not.toContain('pull_request');
  });
});
