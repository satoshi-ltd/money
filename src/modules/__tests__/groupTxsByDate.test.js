import { groupTxsByDate } from '../groupTxsByDate';

const tx = (hash, year, month, day, hour, minute = 0) => ({ hash, timestamp: new Date(year, month, day, hour, minute).getTime() });

describe('modules/groupTxsByDate', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 10, 18, 12));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('a summer entry just after midnight stays on its own day when read in winter', () => {
    const groups = groupTxsByDate([tx('a', 2026, 6, 10, 0, 30), tx('b', 2026, 6, 9, 23, 30)]);

    expect(groups.map(({ data }) => data.map(({ hash }) => hash))).toEqual([['a'], ['b']]);
  });

  test('a winter entry late at night stays on its own day when read in summer', () => {
    jest.setSystemTime(new Date(2026, 6, 18, 12));

    const groups = groupTxsByDate([tx('a', 2026, 0, 10, 23, 30), tx('b', 2026, 0, 10, 8), tx('c', 2026, 0, 11, 0, 15)]);

    expect(groups.map(({ data }) => data.map(({ hash }) => hash))).toEqual([['c'], ['a', 'b']]);
  });

  test('leaves the array it receives in its own order', () => {
    const input = [tx('old', 2026, 0, 1, 9), tx('new', 2026, 0, 5, 9)];

    groupTxsByDate(input);

    expect(input.map(({ hash }) => hash)).toEqual(['old', 'new']);
  });

  test('answers an empty list for no entries', () => {
    expect(groupTxsByDate()).toEqual([]);
  });
});
