import { rangeDelta } from '../rangeDelta';

describe('screens/Stats/rangeDelta', () => {
  test('measures the window it is given, not the whole ledger', () => {
    const ledger = [100, 200, 400, 800, 600];

    expect(rangeDelta(ledger)).toBeCloseTo(500);
    expect(rangeDelta(ledger.slice(-2))).toBeCloseTo(-25);
  });

  test('a falling range reports a fall', () => {
    expect(rangeDelta([954000, 800000, 645000])).toBeCloseTo(-32.39, 1);
  });

  test('a window padded before the ledger opens measures from the first real balance', () => {
    expect(rangeDelta([0, 0, 100, 150])).toBeCloseTo(50);
  });

  test('a flat range is zero, not a fabricated move', () => {
    expect(rangeDelta([500, 500, 500])).toBe(0);
  });

  test('a negative baseline still yields a signed percentage', () => {
    expect(rangeDelta([-200, -100])).toBeCloseTo(50);
  });

  test('nothing to compare yields nothing', () => {
    expect(rangeDelta([100])).toBeUndefined();
    expect(rangeDelta([])).toBeUndefined();
    expect(rangeDelta()).toBeUndefined();
    expect(rangeDelta([0, 0, 0])).toBeUndefined();
  });
});
