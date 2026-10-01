import { columnStyle, columnWidth, railBreakpoint, railWidth } from '../layout';

const WIDEST_PHONE = 440;

describe('theme/layout rail', () => {
  test('the rail is 128 wide from 600 points, and a phone never reaches the line', () => {
    expect(railWidth).toBe(128);
    expect(railBreakpoint).toBe(600);
    expect(railBreakpoint).toBeGreaterThan(WIDEST_PHONE);
  });
});

describe('theme/layout column', () => {
  test('no phone is ever capped: the column is wider than the widest one', () => {
    expect(columnWidth).toBeGreaterThan(WIDEST_PHONE);
  });

  test('the column is full width up to its cap and centred past it', () => {
    expect(columnStyle).toEqual({ alignSelf: 'center', maxWidth: columnWidth, width: '100%' });
  });
});
