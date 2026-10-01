import { buildInsights } from '../insights';
import { dailyNet } from '../dailyNet';
import { exchange } from '../exchange';
import { C } from '../constants';
import { queryCategory } from '../../screens/Category/modules/queryCategory';
import queryChart from '../../screens/Stats/modules/queryChart';
import queryMonth from '../../screens/Stats/modules/queryMonth';

const { EXPENSE } = C.TX.TYPE;

const RATES = { '2026-07': { THB: 30, USD: 1 }, '2026-08': { THB: 32, USD: 1 }, '2026-09': { THB: 40, USD: 1 } };
const ACCOUNTS = [{ currency: 'THB', hash: 'a1', title: 'Wallet' }];
const SETTINGS = { baseCurrency: 'USD' };
const AUGUST = new Date(2026, 7, 10, 12).getTime();
const TX = { account: 'a1', category: 4, hash: 't1', timestamp: AUGUST, title: 'Gasoline', type: EXPENSE, value: 3000 };
const STATE = { accounts: ACCOUNTS, overall: { chartBalance: new Array(7).fill(0) }, rates: RATES, settings: SETTINGS, txs: [TX] };

const AT_ITS_OWN_MONTH = 3000 / 32;
const AT_TODAY = 3000 / 40;

describe('one rule for a past entry: the rate of the month it was made in', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 8, 15, 12));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('exchange itself reads the month of the timestamp, and today only when no timestamp is given', () => {
    expect(exchange(3000, 'THB', 'USD', RATES, AUGUST)).toBeCloseTo(AT_ITS_OWN_MONTH, 8);
    expect(exchange(3000, 'THB', 'USD', RATES)).toBeCloseTo(AT_TODAY, 8);
  });

  test('every surface that tells what happened prices the entry the same way', () => {
    const analytics = Object.values(queryMonth(STATE, 4, 6).expenses[4]).reduce((sum, value) => sum + value, 0);
    const chart = queryChart(STATE, 6).expenses.reduce((sum, value) => sum + value, 0);
    const sheet = queryCategory(STATE, { category: 4, month: 7, type: EXPENSE, year: 2026 }).total;
    const dayHeader = dailyNet([TX], { accounts: ACCOUNTS, baseCurrency: 'USD', rates: RATES });

    expect(analytics).toBeCloseTo(AT_ITS_OWN_MONTH, 8);
    expect(chart).toBeCloseTo(AT_ITS_OWN_MONTH, 8);
    expect(sheet).toBeCloseTo(AT_ITS_OWN_MONTH, 8);
    expect(-dayHeader).toBeCloseTo(AT_ITS_OWN_MONTH, 8);
  });

  test('the day header is pinned to exchange at the entry\'s timestamp, as the rows under it are', () => {
    const rows = exchange(TX.value, 'THB', 'USD', RATES, TX.timestamp);

    expect(-dailyNet([TX], { accounts: ACCOUNTS, baseCurrency: 'USD', rates: RATES })).toBeCloseTo(rows, 8);
  });

  test('the comparison against the usual is the one deliberate exception: the month block reads every month at the latest table', () => {
    const insights = buildInsights({ accounts: ACCOUNTS, now: new Date(2026, 8, 1, 12), rates: RATES, settings: SETTINGS, txs: [TX] });
    const closed = insights.find((insight) => insight.id === 'closed_month');

    expect(closed.value).toBeCloseTo(AT_TODAY, 8);
  });
});
