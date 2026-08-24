import { dropdownOrigin, dropdownPlacement } from '../dropdownHeight';

const ITEM = 44;
const base = { count: 20, edge: 16, itemHeight: ITEM, maxItems: 6, offset: 8, windowHeight: 900 };

describe('components/Dropdown/dropdownPlacement', () => {
  test('before it has been measured it asks for what it wants, and opens downward', () => {
    expect(dropdownPlacement({ ...base })).toEqual({ height: 6 * ITEM, side: 'bottom' });
  });

  test('a short list is only as tall as its options', () => {
    expect(dropdownPlacement({ ...base, anchorTop: 100, count: 3 }).height).toBe(3 * ITEM);
  });

  test('opening high up, it takes the full cap downward', () => {
    expect(dropdownPlacement({ ...base, anchorTop: 100 })).toEqual({ height: 6 * ITEM, side: 'bottom' });
  });


  test('a row near the bottom flips upward, where the room actually is', () => {
    expect(dropdownPlacement({ ...base, anchorTop: 820 }).side).toBe('top');
  });

  test('it stays down whenever the whole list fits there', () => {
    expect(dropdownPlacement({ ...base, anchorTop: 400 })).toEqual({ height: 6 * ITEM, side: 'bottom' });
  });

  test('it takes the longer side, so a low trigger still gets a full list rather than a stub', () => {
    const low = dropdownPlacement({ ...base, anchorTop: 700 });

    expect(low.side).toBe('top');
    expect(low.height).toBe(6 * ITEM);
  });

  test('boxed in on both sides, it still shows two options rather than collapsing', () => {
    expect(dropdownPlacement({ ...base, anchorTop: 90, windowHeight: 150 }).height).toBe(2 * ITEM);
  });


  test('wherever the trigger sits, the list lands inside the screen', () => {
    const frame = { bottomInset: 24, edge: 16, itemHeight: ITEM, maxItems: 6, offset: 8, topInset: 48, windowHeight: 900 };

    [100, 300, 500, 620, 700, 800].forEach((anchorTop) => {
      const { height, side } = dropdownPlacement({ ...frame, anchorTop, count: 20 });
      const { top } = dropdownOrigin({
        ...frame,
        align: 'left',
        anchor: { left: 40, top: anchorTop, width: 320 },
        height,
        side,
        width: 260,
      });

      expect(top).toBeGreaterThanOrEqual(frame.topInset);
      expect(top + height).toBeLessThanOrEqual(frame.windowHeight - frame.bottomInset);
    });
  });

  test('the list always cuts on a hairline, never through an option', () => {
    [560, 600, 640, 680, 700].forEach((anchorTop) => {
      expect(dropdownPlacement({ ...base, anchorTop }).height % ITEM).toBe(0);
    });
  });
});

describe('components/Dropdown/dropdownOrigin', () => {
  const anchor = { left: 40, top: 300, width: 320 };
  const base = { anchor, edge: 16, height: 200, offset: 8, side: 'bottom', topInset: 48, width: 260 };

  test('it hangs from the bottom of its trigger, past the status bar the measurement omits', () => {
    expect(dropdownOrigin({ ...base, align: 'left' }).top).toBe(300 + 48 + 8);
  });

  test('flipped, it sits on top of its trigger instead', () => {
    expect(dropdownOrigin({ ...base, align: 'left', side: 'top' }).top).toBe(300 + 48 - 200 - 8);
  });

  test('a left-aligned list starts where its trigger starts', () => {
    expect(dropdownOrigin({ ...base, align: 'left' }).left).toBe(40);
  });

  test('a right-aligned list ends where its trigger ends', () => {
    expect(dropdownOrigin({ ...base, align: 'right' }).left).toBe(40 + 320 - 260);
  });

  test('a list wider than the room it has still keeps clear of the screen edge', () => {
    expect(dropdownOrigin({ ...base, align: 'right', anchor: { left: 0, top: 300, width: 100 } }).left).toBe(16);
  });
});
