import fs from 'fs';
import path from 'path';

import * as dictionaries from '../../../i18n/dictionaries';

const SRC = path.join(__dirname, '..', '..', '..');
const LIMIT = 12;

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === '__tests__' ? [] : walk(full);
    return entry.name.endsWith('.jsx') ? [full] : [];
  });

// Two ways a label reaches that fixed column: through FieldRow, or hand-rolled onto style.key. Both wrap.
const PATTERNS = [/<FieldRow[^>]*label=\{L10N\.(\w+)\}/g, /style=\{style\.key\}[^>]*>\s*\{L10N\.(\w+)\}/g];

const labelKeys = () => {
  const keys = new Set();
  walk(SRC).forEach((file) => {
    const source = fs.readFileSync(file, 'utf8');
    PATTERNS.forEach((pattern) => [...source.matchAll(pattern)].forEach(([, key]) => keys.add(key)));
  });
  return [...keys];
};

// The label column is a fixed width, so "Opening balance" wrapped onto two lines in every language.
describe('field labels', () => {
  test('every field label is short enough for the column that holds it', () => {
    const tooLong = labelKeys().flatMap((key) =>
      Object.entries(dictionaries)
        .filter(([, dictionary]) => `${dictionary[key] || ''}`.length > LIMIT)
        .map(([language, dictionary]) => `${language}.${key}: "${dictionary[key]}"`),
    );

    expect(tooLong).toEqual([]);
  });

  test('the app really does label its rows through the dictionary', () => {
    expect(labelKeys().length).toBeGreaterThan(4);
  });
});
