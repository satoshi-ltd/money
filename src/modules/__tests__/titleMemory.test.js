import { C } from '../constants';
import { buildTitleMemory, recallTitle, recallTitles } from '../titleMemory';

const { INTERNAL_TRANSFER } = C;
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
  tx('Coffee to go', 30, 35),
  tx('Cinema', 250, 40),
  tx('Salary', 3000, 5, { type: INCOME }),
  tx('Salary', 3100, 45, { type: INCOME }),
  tx('Cold wallet', 500, 50, { category: INTERNAL_TRANSFER }),
];

const memory = buildTitleMemory(LEDGER);

describe('modules/titleMemory', () => {
  describe('recallTitles', () => {
    test('two letters are enough to recognise something you repeat', () => {
      expect(recallTitles(memory, { prefix: 'co', type: EXPENSE })[0].title).toBe('Coffee');
    });

    test('one letter is not: it would propose on every keystroke', () => {
      expect(recallTitles(memory, { prefix: 'c', type: EXPENSE })).toEqual([]);
    });

    test('at most two titles, the most repeated first and the latest breaking a tie', () => {
      expect(recallTitles(memory, { prefix: 'coff', type: EXPENSE }).map(({ title }) => title)).toEqual([
        'Coffee',
        'Coffee to go',
      ]);
    });

    test('each describes its latest entry, since that is the price in force now', () => {
      expect(recallTitles(memory, { prefix: 'coff', type: EXPENSE })[0]).toMatchObject({ count: 3, value: 45 });
    });

    // The offer is the amount, account and category, so a finished title still deserves one.
    test('a complete title is still answered with the entry behind it', () => {
      expect(recallTitles(memory, { prefix: 'coffee', type: EXPENSE })[0]).toMatchObject({ title: 'Coffee', value: 45 });
      expect(recallTitles(buildTitleMemory([tx('Coffee', 40, 10)]), { prefix: 'coffee', type: EXPENSE })).toHaveLength(1);
    });

    test('an expense is never answered with an income', () => {
      expect(recallTitles(memory, { prefix: 'sal', type: EXPENSE })).toEqual([]);
      expect(recallTitles(memory, { prefix: 'sal', type: INCOME })[0]).toMatchObject({ title: 'Salary', value: 3100 });
    });

    test('nothing matching means nothing offered', () => {
      expect(recallTitles(memory, { prefix: 'zz', type: EXPENSE })).toEqual([]);
      expect(recallTitles(buildTitleMemory([]), { prefix: 'coffee', type: EXPENSE })).toEqual([]);
      expect(recallTitles(undefined, { prefix: 'coffee', type: EXPENSE })).toEqual([]);
    });

    test('it carries the account and category too, so one tap fills the form', () => {
      expect(recallTitles(memory, { prefix: 'cin', type: EXPENSE })[0]).toMatchObject({
        account: 'a1',
        category: 4,
        title: 'Cinema',
        value: 250,
      });
    });

    test('a word inside a title finds it too, behind the titles that start with what you typed', () => {
      const beans = buildTitleMemory([
        tx('Coffee beans', 300, 1),
        tx('Coffee beans', 300, 2),
        tx('Coffee beans', 300, 3),
        tx('Beans', 60, 4),
        tx('Green-beans salad', 90, 5),
      ]);
      const titles = (prefix) => recallTitles(beans, { prefix, type: EXPENSE }).map(({ title }) => title);

      expect(titles('bea')).toEqual(['Beans', 'Coffee beans']);
      expect(titles('coffee b')).toEqual(['Coffee beans']);
      expect(titles('gre')).toEqual(['Green-beans salad']);
      expect(titles('eans')).toEqual([]);
    });

    test('a swap between your own accounts is not a concept to repeat', () => {
      expect(recallTitles(memory, { prefix: 'cold', type: EXPENSE })).toEqual([]);
    });
  });

  describe('recallTitle', () => {
    test('a known title answers with its account and category, whatever its case', () => {
      expect(recallTitle(memory, { title: 'coffee', type: EXPENSE })).toEqual({ account: 'a1', category: 4 });
    });

    // One sighting already predicts the next category 85% of the time on a real ledger; a default does far worse.
    test('a title seen once already answers; one never seen under this type does not', () => {
      expect(recallTitle(memory, { title: 'Cinema', type: EXPENSE })).toEqual({ account: 'a1', category: 4 });
      expect(recallTitle(memory, { title: 'Coffee', type: INCOME })).toBeUndefined();
      expect(recallTitle(memory, { title: 'Cold wallet', type: EXPENSE })).toBeUndefined();
      expect(recallTitle(undefined, { title: 'Coffee', type: EXPENSE })).toBeUndefined();
    });
  });

  describe('what counts is what you do lately', () => {
    const drifted = buildTitleMemory([
      ...Array.from({ length: 20 }, (_, i) => tx('Water', 30, i, { category: 4 })),
      ...Array.from({ length: 8 }, (_, i) => tx('Water', 30, 100 + i, { account: 'a2', category: 7 })),
    ]);

    test('the category and account you have used most in the last ten times, not across all time', () => {
      expect(recallTitle(drifted, { title: 'Water', type: EXPENSE })).toEqual({ account: 'a2', category: 7 });
      expect(recallTitles(drifted, { prefix: 'wat', type: EXPENSE })[0]).toMatchObject({ account: 'a2', category: 7 });
    });

    test('a tie between two habits goes to the more recent one', () => {
      const tied = buildTitleMemory([tx('Gym', 30, 1, { category: 4 }), tx('Gym', 30, 2, { category: 8 })]);

      expect(recallTitle(tied, { title: 'Gym', type: EXPENSE }).category).toBe(8);
    });

    test('what you repeat now outranks what you repeated once upon a time', () => {
      const now = new Date(2026, 8, 9).getTime();
      const moved = buildTitleMemory([
        ...Array.from({ length: 20 }, (_, i) => tx('Gym Madrid', 40, new Date(2024, i % 12, 3).getTime())),
        ...Array.from({ length: 3 }, (_, i) => tx('Gym Bangkok', 30, new Date(2026, 5 + i, 3).getTime())),
      ]);

      expect(recallTitles(moved, { now, prefix: 'gym', type: EXPENSE }).map(({ title }) => title)).toEqual([
        'Gym Bangkok',
        'Gym Madrid',
      ]);
    });

    test('a title from last year is still offered: nothing is forgotten, only reordered', () => {
      const now = new Date(2026, 8, 9).getTime();
      const yearly = buildTitleMemory([
        tx('Car insurance', 600, new Date(2024, 8, 1).getTime()),
        tx('Car insurance', 640, new Date(2025, 8, 1).getTime()),
      ]);

      expect(recallTitles(yearly, { now, prefix: 'car', type: EXPENSE })[0]).toMatchObject({ count: 2, value: 640 });
    });

    test('order of arrival does not matter, only when it happened', () => {
      const shuffled = buildTitleMemory([tx('Gym', 50, 9), tx('Gym', 30, 1), tx('Gym', 40, 5)]);

      expect(recallTitles(shuffled, { prefix: 'gym', type: EXPENSE })[0].value).toBe(50);
    });
  });
});
