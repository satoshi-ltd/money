import fs from 'fs';
import path from 'path';

const SRC = path.join(__dirname, '..', '..');

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === '__tests__' ? [] : walk(full);
    return /\.jsx?$/.test(entry.name) ? [full] : [];
  });

// The wordmark is uppercase. It had drifted into fifteen strings and two screens in lower case.
describe('i18n/brand', () => {
  test('the mark is never written in lower case', () => {
    const offenders = walk(SRC)
      .filter((file) => /môney/.test(fs.readFileSync(file, 'utf8')))
      .map((file) => path.relative(SRC, file));

    expect(offenders).toEqual([]);
  });
});
