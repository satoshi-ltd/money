import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const REPOSITORY = 'satoshi-ltd/money';

const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );

export function publicUrl(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) {
    throw new Error('Expected a public HTTPS URL without credentials, query or fragment');
  }
  return url.href.replace(/\/$/, '');
}

export function latestEntry(changelog) {
  const entry = changelog.split(/^## /m)[1];
  return entry ? entry.trim() : '';
}

export const STORES = {
  appStore: 'https://apps.apple.com/us/app/m%C3%B4ney/id6738948243',
  playStore: 'https://play.google.com/store/apps/details?id=com.satoshilimited.money',
};

export function storeUrls({ appStore, playStore } = {}) {
  const apple = publicUrl(appStore || STORES.appStore);
  if (new URL(apple).hostname !== 'apps.apple.com') throw new Error('Invalid App Store URL');
  const play = new URL(playStore || STORES.playStore);
  const listing = play.pathname === '/store/apps/details' && play.searchParams.get('id');
  if (play.origin !== 'https://play.google.com' || play.username || play.password || play.hash || !listing) {
    throw new Error('Invalid Google Play URL');
  }
  return { apple, play: play.href };
}

export function render(template, { version, release, notes, siteUrl, stores }) {
  if (release && (!/^v\d+\.\d+\.\d+$/.test(release.tag_name) || release.draft)) {
    throw new Error('Expected a published versioned release');
  }
  if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error(`Invalid version: ${version}`);
  const name = `money-${version}-android.apk`;
  const asset = release ? (release.assets || []).find((a) => a.name === name) : undefined;
  const live = asset && asset.size > 0;
  if (live) {
    const expected = `https://github.com/${REPOSITORY}/releases/download/v${version}/${name}`;
    if (publicUrl(asset.browser_download_url) !== expected) throw new Error(`Unexpected release asset URL: ${name}`);
  }
  const icon = (id) => `<svg class="platform-icon" aria-hidden="true" focusable="false"><use href="assets/platforms.svg#${id}"></use></svg>`;
  const android = live
    ? `<a class="button" href="${escape(asset.browser_download_url)}">${icon('android')}<span>Download the APK</span><span class="download-arrow" aria-hidden="true">↗</span></a>`
    : `<span class="button link-pending" aria-disabled="true">${icon('android')}<span>APK not published yet</span></span>`;
  const { apple, play } = storeUrls(stores);
  const tokens = {
    VERSION: escape(version),
    RELEASE_NOTES: escape(notes || 'The notes of this version appear here once it is published.'),
    ANDROID_DOWNLOAD: android,
    APP_STORE: `<a class="store" href="${escape(apple)}">${icon('apple')}<span>App Store<small>iPhone &amp; iPad ↗</small></span></a>`,
    PLAY_STORE: `<a class="store" href="${escape(play)}">${icon('android')}<span>Google Play<small>Android ↗</small></span></a>`,
    CANONICAL: siteUrl ? `<link rel="canonical" href="${escape(publicUrl(siteUrl))}/">` : '',
  };
  return template.replace(/\{\{([A-Z_]+)\}\}/g, (_, key) => {
    if (!(key in tokens)) throw new Error(`Unknown template token: ${key}`);
    return tokens[key];
  });
}

export const HEADERS = `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Content-Security-Policy: default-src 'self'; style-src 'self'; font-src 'self'; img-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'
`;

export async function build({ output, release, siteUrl, stores, clean = true } = {}) {
  const pkgVersion = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8')).version;
  const version = release ? release.tag_name.slice(1) : pkgVersion;
  const notes = release ? release.body : latestEntry(await readFile(path.join(root, 'CHANGELOG.md'), 'utf8'));
  let html = render(await readFile(path.join(root, 'site/index.html'), 'utf8'), { version, release, notes, siteUrl, stores });
  for (const file of ['styles.css', 'theme.js', 'interactive.js']) {
    const hash = createHash('sha1').update(await readFile(path.join(root, 'site', file))).digest('hex').slice(0, 10);
    html = html.replace(`"${file}"`, `"${file}?v=${hash}"`);
  }
  const dist = path.resolve(output || path.join(root, 'site/dist'));
  if (clean) await rm(dist, { recursive: true, force: true });
  await mkdir(path.join(dist, 'assets'), { recursive: true });
  await writeFile(path.join(dist, 'index.html'), html);
  await writeFile(path.join(dist, '_headers'), HEADERS);
  for (const file of ['styles.css', 'theme.js', 'interactive.js']) {
    await cp(path.join(root, 'site', file), path.join(dist, file));
  }
  await cp(path.join(root, 'site/assets'), path.join(dist, 'assets'), { recursive: true });
  for (const [from, to] of [
    ['assets/favicon.png', 'favicon.png'],
    ['assets/fonts/GeistMono-Regular.ttf', 'GeistMono-Regular.ttf'],
    ['assets/fonts/GeistMono-Medium.ttf', 'GeistMono-Medium.ttf'],
  ]) {
    await cp(path.join(root, from), path.join(dist, 'assets', to));
  }
  return { dist, version, published: Boolean(release) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const explicit = process.env.RELEASE_JSON;
  const releasePath = explicit || path.join(root, 'site/release.json');
  const stored = await readFile(releasePath, 'utf8').catch((error) => {
    if (error.code !== 'ENOENT') throw error;
    if (explicit) {
      throw new Error(
        `Published release metadata not found: ${releasePath}. Run yarn site:release first (with GH_TOKEN or GitHub CLI access), or unset RELEASE_JSON to build from the package.json version.`,
      );
    }
    return null;
  });
  const { dist, version, published } = await build({
    output: process.env.SITE_OUTPUT,
    release: stored ? JSON.parse(stored) : null,
    siteUrl: process.env.SITE_URL,
    stores: { appStore: process.env.APP_STORE_URL, playStore: process.env.PLAY_STORE_URL },
    clean: !process.env.SITE_OUTPUT,
  });
  console.log(
    `Built static site: ${dist}${published ? '' : ` (no published release with an APK: version ${version} from package.json, Android pending; run yarn site:release for published metadata)`}`,
  );
}
