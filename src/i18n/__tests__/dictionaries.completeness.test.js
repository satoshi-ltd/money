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

  test('the Settings labels are sentence case in every language that writes that way', () => {
    const keys = ['ABOUT', 'CHOOSE_CURRENCY', 'EXPORT_DATA', 'IMPORT_DATA', 'PRIVACY', 'REMINDER_BACKUP', 'SCHEDULE_BACKUP', 'SYNC_RATES_CTA'];
    const proper = new Set(['CSV', 'Money', 'Môney']);

    [['EN', EN], ...LANGUAGES.filter(([name]) => name !== 'DE')].forEach(([name, dictionary]) => {
      keys.forEach((key) => {
        const capitalised = dictionary[key]
          .split(' ')
          .slice(1)
          .filter((word) => !proper.has(word) && /^\p{Lu}/u.test(word));
        expect({ [name]: { [key]: capitalised } }).toEqual({ [name]: { [key]: [] } });
      });
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
