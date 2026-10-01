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

  test('locking the app is never called logging out: there is no account to leave', () => {
    const verbs = { EN: /lock/i, ES: /bloque/i, PT: /bloque/i, FR: /verrouill/i, DE: /sperr/i };

    [['EN', EN], ...LANGUAGES].forEach(([name, dictionary]) => {
      ['LOCK', 'CONFIRM_LOCK'].forEach((key) => expect({ [name]: verbs[name].test(dictionary[key]) }).toEqual({ [name]: true }));
      expect(dictionary.LOG_OUT).toBeUndefined();
    });
  });

  test('every language owns twelve distinct short months, lower case and short enough for a chart slot', () => {
    [['EN', EN], ...LANGUAGES].forEach(([name, dictionary]) => {
      const months = dictionary.MONTHS_SHORT;

      expect({ [name]: months.length }).toEqual({ [name]: 12 });
      expect({ [name]: new Set(months).size }).toEqual({ [name]: 12 });
      expect({ [name]: months.filter((month) => month !== month.toLowerCase() || month.length > 5) }).toEqual({ [name]: [] });
    });
  });

  test('the hide label names the month as well as Analytics, because the box hides from both', () => {
    const month = { EN: /month/i, ES: /mes/i, PT: /mês/i, FR: /mois/i, DE: /monat/i };

    [['EN', EN], ...LANGUAGES].forEach(([name, dictionary]) => {
      expect({ [name]: month[name].test(dictionary.HIDE_FROM_ANALYTICS) }).toEqual({ [name]: true });
    });
  });

  // One line at the default size: a caption that has to wrap has said more than its slot can hold.
  test('the strings in a tight slot stay under that slot\'s ceiling in every language', () => {
    const CEILINGS = {
      ERROR_SERVICE_RATES: 60,
      ERROR_IMPORT: 60,
      CONFIRM_DELETION_CAPTION: 60,
      CONFIRM_LOCK_CAPTION: 60,
      SCHEDULED_AUTOCREATE_LIMIT: 60,
      SCHEDULED_EMPTY_GUIDE: 48,
      EMPTY_ACCOUNTS_CAPTION: 48,
      BIOMETRIC_UNLOCK_INVALIDATED: 48,
      BIOMETRIC_UNLOCK_NOT_AVAILABLE: 32,
      MASK_AMOUNTS_CAPTION: 32,
      REMINDER_TIME_CAPTION: 32,
      SCHEDULED_IMPACT_CAPTION: 24,
      ONB_ACCOUNT_NOTE: 90,
    };

    [['EN', EN], ...LANGUAGES].forEach(([name, dictionary]) => {
      const over = Object.entries(CEILINGS)
        .filter(([key, ceiling]) => [...dictionary[key]].length > ceiling)
        .map(([key]) => key);

      expect({ [name]: over }).toEqual({ [name]: [] });
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
