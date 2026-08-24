import { chartBounds, compactFigure, linePath, pointAt, trendPath } from '../chartPath';

const GEOMETRY = { height: 100, padding: 10, width: 300 };

const points = (path) => path.match(/[ML][-\d.]+ [-\d.]+/g) || [];

describe('modules/chartPath', () => {
  test('the line starts at the left edge and ends at the right', () => {
    const path = linePath([0, 50, 100], GEOMETRY);
    const [first, last] = [points(path)[0], points(path).pop()];

    expect(first).toBe('M0.00 90.00');
    expect(last).toBe('L300.00 10.00');
  });

  test('one point per value', () => {
    expect(points(linePath([1, 2, 3, 4, 5], GEOMETRY))).toHaveLength(5);
  });

  test('a flat series stays on the canvas instead of dividing by zero', () => {
    expect(linePath([500, 500, 500], GEOMETRY)).not.toContain('NaN');
    expect(linePath([0, 0], GEOMETRY)).not.toContain('NaN');
  });

  test('the trend is a moving average that tracks the line, not a straight fit', () => {
    const path = trendPath([0, 100, 0, 100, 0], GEOMETRY);
    const ys = points(path).map((point) => Number(point.slice(1).split(' ')[1]));

    expect(points(path)).toHaveLength(5);
    expect(new Set(ys).size).toBeGreaterThan(1);
  });

  test('pointAt lands on the same coordinates the line draws', () => {
    const values = [0, 50, 100];
    const { x, y } = pointAt(values, 2, GEOMETRY);

    expect(`L${x.toFixed(2)} ${y.toFixed(2)}`).toBe(points(linePath(values, GEOMETRY)).pop());
  });

  test('bounds report the extremes of the series', () => {
    expect(chartBounds([3, 9, 1])).toEqual({ max: 9, min: 1 });
  });

  test('figures are abbreviated for the axis', () => {
    expect(compactFigure(552701)).toBe('553k');
    expect(compactFigure(1250000)).toBe('1.3M');
    expect(compactFigure(842)).toBe('842');
    expect(compactFigure(0)).toBe('0');
  });
});
