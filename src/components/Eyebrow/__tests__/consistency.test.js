import fs from 'fs';
import path from 'path';

const SRC = path.join(__dirname, '..', '..', '..');

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === '__tests__' ? [] : walk(full);
    return entry.name.endsWith('.jsx') ? [full] : [];
  });

// The small uppercase label was hand-rolled 29 times, and 28 of them had drifted off the spec.
describe('components/Eyebrow consistency', () => {
  test('no screen hand-rolls the eyebrow out of a raw Text', () => {
    const rolled = walk(SRC)
      .filter((file) => !file.endsWith('Eyebrow.jsx'))
      .filter((file) => /<Text[^>]*size="xxs"[^>]*uppercase/.test(fs.readFileSync(file, 'utf8')))
      .map((file) => path.relative(SRC, file));

    expect(rolled).toEqual([]);
  });

  test('the app really does use it in more than one place', () => {
    const users = walk(SRC).filter((file) => fs.readFileSync(file, 'utf8').includes('<Eyebrow'));

    expect(users.length).toBeGreaterThan(5);
  });
});
