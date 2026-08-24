import { execSync } from 'child_process';

import { EN } from '../dictionaries';

const REFERENCES = execSync("grep -rho 'L10N\\.[A-Z][A-Z0-9_]*' src --include=*.jsx --include=*.js")
  .toString()
  .split('\n')
  .filter(Boolean)
  .map((match) => match.replace('L10N.', ''));

describe('i18n/dictionaries', () => {
  test('every key the app renders exists, so no screen prints a raw key', () => {
    const unknown = [...new Set(REFERENCES)].filter((key) => EN[key] === undefined).sort();

    expect(unknown).toEqual([]);
  });
});
