import { repeatSuggestion } from '../repeatSuggestion';

const EXPENSE = 0;
const INCOME = 1;

const tx = (title, value, timestamp, extra = {}) => ({
  account: 'a1',
  category: 4,
  timestamp,
  title,
  type: EXPENSE,
  value,
  ...extra,
});

const LEDGER = [
  tx('Coffee', 40, 10),
  tx('Coffee', 40, 20),
  tx('Coffee', 45, 30),
  tx('Coffeeshop beans', 320, 25),
  tx('Cinema', 250, 40),
  tx('Salary', 3000, 5, { type: INCOME }),
];

describe('modules/repeatSuggestion', () => {
  test('two letters are enough to recognise something you repeat', () => {
    expect(repeatSuggestion(LEDGER, { prefix: 'co', type: EXPENSE }).title).toBe('Coffee');
  });

  test('one letter is not: it would propose on every keystroke', () => {
    expect(repeatSuggestion(LEDGER, { prefix: 'c', type: EXPENSE })).toBeUndefined();
  });

  test('the most repeated title wins, not merely the most recent', () => {
    expect(repeatSuggestion(LEDGER, { prefix: 'coff', type: EXPENSE })).toMatchObject({ count: 3, title: 'Coffee' });
  });

  test('it describes the latest one, since that is the price in force now', () => {
    expect(repeatSuggestion(LEDGER, { prefix: 'coff', type: EXPENSE }).value).toBe(45);
  });

  // The offer is the amount, account and category, so a finished title still deserves one.
  test('a complete title is still answered with the entry behind it', () => {
    expect(repeatSuggestion(LEDGER, { prefix: 'coffee', type: EXPENSE })).toMatchObject({ title: 'Coffee', value: 45 });
    expect(repeatSuggestion([tx('Coffee', 40, 10)], { prefix: 'coffee', type: EXPENSE })).toMatchObject({ value: 40 });
  });

  test('an expense is never answered with an income', () => {
    expect(repeatSuggestion(LEDGER, { prefix: 'sal', type: EXPENSE })).toBeUndefined();
    expect(repeatSuggestion(LEDGER, { prefix: 'sal', type: INCOME }).title).toBe('Salary');
  });

  test('nothing matching means nothing offered', () => {
    expect(repeatSuggestion(LEDGER, { prefix: 'zz', type: EXPENSE })).toBeUndefined();
    expect(repeatSuggestion([], { prefix: 'coffee', type: EXPENSE })).toBeUndefined();
  });

  test('it carries the account and category too, so one tap fills the form', () => {
    const suggestion = repeatSuggestion(LEDGER, { prefix: 'cin', type: EXPENSE });

    expect(suggestion).toMatchObject({ account: 'a1', category: 4, title: 'Cinema', value: 250 });
  });
});
