import { getScheduledOccurrenceKey, getScheduledOccurrenceKeyFromTx } from '../scheduledKey';

describe('modules/scheduledKey', () => {
  test('builds stable keys from scheduled metadata', () => {
    expect(getScheduledOccurrenceKey({ scheduledId: 'rent', occurrenceAt: 1234567890 })).toBe('rent:1234567890');
    expect(getScheduledOccurrenceKey({ scheduledId: 12, occurrenceAt: '42' })).toBe('12:42');
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
    ).toBe('rent:123');

    expect(getScheduledOccurrenceKeyFromTx({ meta: { kind: 'manual', scheduledId: 'rent', occurrenceAt: 123 } })).toBe(
      undefined,
    );
  });
});
