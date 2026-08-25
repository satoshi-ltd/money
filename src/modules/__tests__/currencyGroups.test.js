import { C } from '../constants';
import { EN } from '../../i18n/dictionaries';

const { CURRENCY_GROUPS, SYMBOL } = C;

const grouped = CURRENCY_GROUPS.flatMap(({ codes }) => codes);

describe('modules/CURRENCY_GROUPS', () => {
  // The onboarding picker has no search: a currency missing from a group is a currency nobody can choose.
  test('every currency the app offers belongs to exactly one group', () => {
    expect([...grouped].sort()).toEqual(Object.keys(SYMBOL).sort());
    expect(new Set(grouped).size).toBe(grouped.length);
  });

  test('the flat dropdown and the sectioned picker read in the same order', () => {
    expect(grouped).toEqual(Object.keys(SYMBOL));
  });

  test('every group has a name to show above it', () => {
    const unnamed = CURRENCY_GROUPS.filter(({ id }) => !EN.CURRENCY_GROUP[id]).map(({ id }) => id);

    expect(unnamed).toEqual([]);
  });
});
