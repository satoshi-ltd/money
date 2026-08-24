import fs from 'fs';
import path from 'path';

const SRC = path.join(__dirname, '..', '..', '..');

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === '__tests__' ? [] : walk(full);
    return entry.name.endsWith('.jsx') ? [full] : [];
  });

const callSites = walk(SRC)
  .map((file) => ({ file: path.relative(SRC, file), source: fs.readFileSync(file, 'utf8') }))
  .filter(({ source }) => source.includes('<Dropdown'))
  .map(({ file, source }) => ({ file, calls: source.match(/<Dropdown[\s\S]*?\/>/g) || [] }));

describe('components/Dropdown consistency', () => {
  test('the app really does open dropdowns in more than one place', () => {
    expect(callSites.length).toBeGreaterThan(2);
  });

  test('no call site restates the shared behaviour: one width, one alignment, one page size', () => {
    const restated = callSites.flatMap(({ calls, file }) =>
      calls
        .filter((call) => /\b(align|width|maxItems|itemHeight)=/.test(call))
        .map((call) => `${file}: ${call.match(/\b(align|width|maxItems|itemHeight)=/)[1]}`),
    );

    expect(restated).toEqual([]);
  });

  test('no call site hand-rolls its own option row', () => {
    const custom = callSites.flatMap(({ calls, file }) =>
      calls.filter((call) => call.includes('renderOption')).map(() => file),
    );

    expect(custom).toEqual([]);
  });
});
