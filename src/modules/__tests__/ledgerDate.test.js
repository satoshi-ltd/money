import { ledgerDate } from '../ledgerDate';

const DAY = new Date(2026, 7, 23);

describe('modules/ledgerDate', () => {
  test('an entry is dated weekday, day, month, year — the order a ledger uses', () => {
    expect(ledgerDate(DAY, 'en-US')).toBe('Sun 23 Aug 2026');
  });

  // Only the names are the reader's; the order is the house's.
  test('the names follow the language while the order stays put', () => {
    expect(ledgerDate(DAY, 'es-ES')).toBe('dom 23 ago 2026');
    expect(ledgerDate(DAY, 'de-DE')).toBe('So 23 Aug 2026');
  });

  test('no commas or full stops survive, whatever the locale puts in', () => {
    ['en-US', 'es-ES', 'pt-BR', 'fr-FR', 'de-DE'].forEach((locale) => {
      expect(ledgerDate(DAY, locale)).not.toMatch(/[.,]/);
    });
  });

  test('it takes a timestamp as readily as a date', () => {
    expect(ledgerDate(DAY.getTime(), 'en-US')).toBe(ledgerDate(DAY, 'en-US'));
  });
});
