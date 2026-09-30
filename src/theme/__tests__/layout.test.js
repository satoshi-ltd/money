import { columnStyle, columnWidth } from '../layout';

const WIDEST_PHONE = 440;

describe('theme/layout column', () => {
  test('no phone is ever capped: the column is wider than the widest one', () => {
    expect(columnWidth).toBeGreaterThan(WIDEST_PHONE);
  });

  test('the column is full width up to its cap and centred past it', () => {
    expect(columnStyle).toEqual({ alignSelf: 'center', maxWidth: columnWidth, width: '100%' });
  });
});
