import { clampTextScale, DEFAULT_TEXT_SCALE, scaledType, TEXT_SCALES } from '../textScale';

describe('textScale', () => {
  test('the steps are ordered, unique, and include the default', () => {
    expect(TEXT_SCALES).toEqual([...TEXT_SCALES].sort((a, b) => a - b));
    expect(new Set(TEXT_SCALES).size).toBe(TEXT_SCALES.length);
    expect(TEXT_SCALES).toContain(DEFAULT_TEXT_SCALE);
  });

  test('a value off either end lands on the nearest step, never beyond it', () => {
    const [min] = TEXT_SCALES;
    const max = TEXT_SCALES[TEXT_SCALES.length - 1];

    expect(clampTextScale(99)).toBe(max);
    expect(clampTextScale(0.1)).toBe(min);
    expect(clampTextScale(-3)).toBe(min);
  });

  // A hand-edited backup is the way a number that is not a number reaches this.
  test('anything that is not a usable number reads as the default', () => {
    for (const value of [undefined, null, '', ' ', 'large', true, {}, NaN, Infinity]) {
      expect(clampTextScale(value)).toBe(DEFAULT_TEXT_SCALE);
    }
  });

  test('a stored string is read as its number', () => {
    expect(clampTextScale('1.3')).toBe(1.3);
  });

  test('the default scale adds no style at all, so the common case pays nothing', () => {
    expect(scaledType([{ fontSize: 14, lineHeight: 19 }], DEFAULT_TEXT_SCALE)).toBeNull();
    expect(scaledType([{ fontSize: 14 }], undefined)).toBeNull();
  });

  test('both the size and its line height grow together, rounded to whole points', () => {
    expect(scaledType([{ fontSize: 14, lineHeight: 19 }], 1.3)).toEqual({ fontSize: 18, lineHeight: 25 });
  });

  test('the last style wins, so a screen that sets its own size still scales', () => {
    expect(scaledType([{ fontSize: 14 }, { fontSize: 26 }], 1.15)).toEqual({ fontSize: 30 });
  });

  test('text carrying no size of its own is left alone', () => {
    expect(scaledType([{ color: 'red' }], 1.3)).toBeNull();
    expect(scaledType(undefined, 1.3)).toBeNull();
  });
});
