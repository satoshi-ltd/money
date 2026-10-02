import { execFileSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_REPO = 'satoshi-ltd/money';

export function selectRelease(releases) {
  const release = releases
    .filter((r) => !r.draft && !r.prerelease && /^v\d+\.\d+\.\d+$/.test(r.tag_name))
    .filter((r) => r.assets.some((a) => a.name === `money-${r.tag_name.slice(1)}-android.apk` && a.size > 0))
    .sort((a, b) => b.tag_name.slice(1).localeCompare(a.tag_name.slice(1), 'en', { numeric: true }))[0];
  return release || null;
}

export function resolveToken(env = process.env) {
  if (env.GH_TOKEN || env.GITHUB_TOKEN) return env.GH_TOKEN || env.GITHUB_TOKEN;
  try {
    return execFileSync('gh', ['auth', 'token'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    throw new Error(
      'GitHub token is required to read release metadata: set GH_TOKEN or GITHUB_TOKEN, or install GitHub CLI and run gh auth login.',
    );
  }
}

export async function readRelease({
  repo = process.env.GITHUB_REPOSITORY || DEFAULT_REPO,
  token = resolveToken(),
  fetch = globalThis.fetch,
} = {}) {
  if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) throw new Error('Repository is required');
  const response = await fetch(`https://api.github.com/repos/${repo}/releases?per_page=100`, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  if (!response.ok) {
    throw new Error(`GitHub releases request failed for ${repo}: ${response.status} ${response.statusText}`);
  }
  return selectRelease(await response.json());
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const release = await readRelease();
  await writeFile('site/release.json', JSON.stringify(release, null, 2));
  console.log(
    release
      ? `Read published release ${release.tag_name}`
      : 'No published release carries an APK yet: the site builds with the Android button pending',
  );
}
