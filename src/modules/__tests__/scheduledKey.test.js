import { getScheduledOccurrenceKey, getScheduledOccurrenceKeyFromTx } from '../scheduledKey';

describe('modules/scheduledKey', () => {
  const MADRID_NOON = new Date(2026, 10, 1, 12).getTime();
  const NEW_YORK_NOON = MADRID_NOON + 6 * 60 * 60 * 1000;

  test('builds stable keys from the template and the local day of the occurrence', () => {
    expect(getScheduledOccurrenceKey({ scheduledId: 'rent', occurrenceAt: MADRID_NOON })).toBe('rent:2026-11-01');
    expect(getScheduledOccurrenceKey({ scheduledId: 12, occurrenceAt: `${MADRID_NOON}` })).toBe('12:2026-11-01');
  });

  test('the same occurrence keeps its key when it was stamped at midday in another timezone', () => {
    expect(getScheduledOccurrenceKey({ scheduledId: 'rent', occurrenceAt: NEW_YORK_NOON })).toBe(
      getScheduledOccurrenceKey({ scheduledId: 'rent', occurrenceAt: MADRID_NOON }),
    );
  });

  test('returns undefined for incomplete data', () => {
    expect(getScheduledOccurrenceKey({ scheduledId: '', occurrenceAt: 1 })).toBeUndefined();
    expect(getScheduledOccurrenceKey({ scheduledId: 'rent', occurrenceAt: 'abc' })).toBeUndefined();
  });

  test('extracts keys from scheduled transactions only', () => {
    expect(
      getScheduledOccurrenceKeyFromTx({
        meta: { kind: 'scheduled', scheduledId: 'rent', occurrenceAt: 123 },
      }),
    ).toBe(getScheduledOccurrenceKey({ scheduledId: 'rent', occurrenceAt: 123 }));

    expect(getScheduledOccurrenceKeyFromTx({ meta: { kind: 'manual', scheduledId: 'rent', occurrenceAt: 123 } })).toBe(
      undefined,
    );
  });
});
