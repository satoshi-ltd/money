import { percentText, withThinSpace } from '../figureText';

const THIN_SPACE = ' ';

describe('modules/figureText', () => {
  test('a percent is set with a thin space, not a word space', () => {
    expect(percentText(40)).toBe(`40${THIN_SPACE}%`);
    expect(percentText(40)).not.toContain(' %');
  });

  test('signed percentages carry a real minus, never a hyphen', () => {
    expect(percentText(-25, { signed: true })).toBe(`−25${THIN_SPACE}%`);
    expect(percentText(2.5, { decimals: 1, signed: true })).toBe(`+2.5${THIN_SPACE}%`);
  });

  test('unsigned negatives keep their own sign', () => {
    expect(percentText(-25)).toBe(`-25${THIN_SPACE}%`);
  });

  test('decimals are opt-in, so shares stay whole', () => {
    expect(percentText(31.4)).toBe(`31${THIN_SPACE}%`);
    expect(percentText(31.44, { decimals: 2 })).toBe(`31.44${THIN_SPACE}%`);
  });

  test('nothing to show yields nothing', () => {
    expect(percentText(undefined)).toBe('');
    expect(percentText(NaN)).toBe('');
  });

  test('the currency symbol gets the same thin space', () => {
    expect(withThinSpace('€')).toBe(`${THIN_SPACE}€`);
  });
});
