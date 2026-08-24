import { DE, EN, ES, FR, PT } from '../dictionaries';

const LANGUAGES = [
  ['ES', ES],
  ['PT', PT],
  ['FR', FR],
  ['DE', DE],
];

describe('i18n/dictionaries', () => {
  test('every English key is translated in every language', () => {
    const keys = Object.keys(EN);

    LANGUAGES.forEach(([name, dictionary]) => {
      const missing = keys.filter((key) => dictionary[key] === undefined);
      expect({ [name]: missing }).toEqual({ [name]: [] });
    });
  });

  test('no screen renders a raw key: the analytics copy resolves', () => {
    [EN, ...LANGUAGES.map(([, dictionary]) => dictionary)].forEach((dictionary) => {
      ['NET_WORTH', 'ACCOUNT_BALANCE', 'MONTH_TO_DATE', 'FLOW_IN', 'FLOW_OUT', 'AVERAGE', 'NET'].forEach((key) => {
        expect(typeof dictionary[key]).toBe('string');
        expect(dictionary[key]).not.toBe(key);
      });
    });
  });
});
