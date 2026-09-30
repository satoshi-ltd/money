import fs from 'fs';
import path from 'path';

const SRC = path.join(__dirname, '..', '..');
const NATIVE = new Set([path.join('services', 'NotificationsService.js')]);
const LITERALS = [
  /['"]#[0-9A-Fa-f]{3,8}['"]/,
  /(?:rgb|hsl)a?\s*\(/,
  /(?:[cC]olor|background)\w*:\s*['"](?:white|black|red|green|blue|gray|grey|orange|yellow)['"]/,
  /[Rr]adius\s*[:=]\s*\{?\s*[\d(]/,
];

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return ['__tests__', 'theme'].includes(entry.name) ? [] : walk(full);
    return /\.jsx?$/.test(entry.name) ? [full] : [];
  });

describe('theme/tokens', () => {
  test('no colour or radius is written as a literal outside the theme', () => {
    const offenders = walk(SRC)
      .map((file) => path.relative(SRC, file))
      .filter((file) => !NATIVE.has(file))
      .filter((file) => LITERALS.some((literal) => literal.test(fs.readFileSync(path.join(SRC, file), 'utf8'))));

    expect(offenders).toEqual([]);
  });
});
