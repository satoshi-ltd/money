import { sheetContentHeight, sheetDetent, sheetDetents } from '../sheetDetent';
import { theme } from '../../theme';
import { buttonHeight, iconButtonSize, rowHeight } from '../../theme/layout';

describe('modules/sheetDetent', () => {
  test('each row adds exactly one row of height', () => {
    expect(sheetContentHeight({ rows: 4 }) - sheetContentHeight({ rows: 3 })).toBe(rowHeight);
  });

  test('a form with a hero figure is taller than one without', () => {
    expect(sheetContentHeight({ hero: true, rows: 4 })).toBeGreaterThan(sheetContentHeight({ rows: 4 }));
  });

  test('a form with no actions saves the button row', () => {
    expect(sheetContentHeight({ actions: 0, rows: 4 })).toBeLessThan(sheetContentHeight({ actions: 1, rows: 4 }));
  });

  test('each toggle is paid for, so a form with two is taller than one with one', () => {
    expect(sheetContentHeight({ rows: 4, toggles: 1 })).toBeGreaterThan(sheetContentHeight({ rows: 4 }));
    expect(sheetContentHeight({ rows: 4, toggles: 2 })).toBeGreaterThan(sheetContentHeight({ rows: 4, toggles: 1 }));
  });

  test('the home indicator is part of the sheet, not something the actions hide behind', () => {
    expect(sheetContentHeight({ bottom: 34, rows: 4 }) - sheetContentHeight({ rows: 4 })).toBe(34);
  });

  test('every part of a real form fits inside its own detent', () => {
    const bottom = 34;
    const content = sheetContentHeight({ bottom, rows: 5, toggles: 1 });
    const windowHeight = 852;

    expect(content).toBeGreaterThanOrEqual(
      iconButtonSize + theme.spacing.md + 5 * rowHeight + buttonHeight + bottom,
    );
    expect(sheetDetent(content, windowHeight) * windowHeight).toBeGreaterThanOrEqual(content);
  });

  test('the detent rounds up, so the actions are never clipped by a rounding error', () => {
    expect(sheetDetent(401, 1000)).toBe(0.41);
  });

  test('the same form is a smaller fraction of a taller screen', () => {
    const content = sheetContentHeight({ hero: true, rows: 4 });

    expect(sheetDetent(content, 900)).toBeLessThan(sheetDetent(content, 700));
  });

  test('a short form never collapses and a long one never covers the screen', () => {
    expect(sheetDetent(10, 900)).toBeGreaterThanOrEqual(0.3);
    expect(sheetDetent(100000, 900)).toBeLessThanOrEqual(0.94);
  });

  test('an unknown window height falls back to the tallest sheet, never to zero', () => {
    expect(sheetDetent(500, 0)).toBe(0.94);
    expect(sheetDetent(500, undefined)).toBe(0.94);
  });

  test('a real form lands in a sane range on a typical phone', () => {
    const detent = sheetDetent(sheetContentHeight({ bottom: 34, rows: 5, toggles: 1 }), 800);

    expect(detent).toBeGreaterThan(0.4);
    expect(detent).toBeLessThan(0.7);
  });

  test('a form with no inputs rests at its content height and stays there', () => {
    expect(sheetDetents(sheetContentHeight({ hero: true, rows: 6 }), 852)).toHaveLength(1);
  });

  test('a form with inputs gets a second, taller detent for the keyboard to expand into', () => {
    const [resting, raised] = sheetDetents(sheetContentHeight({ rows: 5, toggles: 1 }), 852, { keyboard: true });

    expect(raised).toBeGreaterThan(resting);
    expect(raised).toBeLessThanOrEqual(0.94);
  });

  test('a form already at full height never offers a second detent the native side would reject', () => {
    expect(sheetDetents(4000, 852, { keyboard: true })).toEqual([0.94]);
  });

  test('headings are paid for, so a sheet with two of them is taller than one with none', () => {
    expect(sheetContentHeight({ headings: 2, rows: 4 })).toBeGreaterThan(sheetContentHeight({ rows: 4 }));
  });

  // A category with two merchants stays small; one with twenty grows until MAX stops it.
  test('a long list grows the sheet, a short one leaves it small, and neither passes the cap', () => {
    const frame = { actions: 0, headings: 2, hero: true };
    const short = sheetDetent(sheetContentHeight({ ...frame, rows: 2 }), 900);
    const long = sheetDetent(sheetContentHeight({ ...frame, rows: 25 }), 900);

    expect(short).toBeLessThan(0.6);
    expect(long).toBe(0.94);
  });

  // Android multiplies the fraction by the container minus the top inset, so the same figure must divide it.
  test('the status bar is not sheet to fill, so the fraction is taken out of what is left', () => {
    expect(sheetDetent(452, 923, 48)).toBeGreaterThan(sheetDetent(452, 923, 0));
  });

  test('whatever the inset, the sheet that comes back really does hold the content', () => {
    [0, 24, 48].forEach((topInset) => {
      const content = sheetContentHeight({ bottom: 24, rows: 5, toggles: 1 });
      const available = 923 - topInset;

      expect(sheetDetent(content, 923, topInset) * available).toBeGreaterThanOrEqual(content);
    });
  });
});
