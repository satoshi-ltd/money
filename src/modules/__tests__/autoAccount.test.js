import { buildAutoAccountCatalog, learnAutoAccount, suggestAccount } from '../autoAccount';

describe('autoAccount', () => {
  test('buildAutoAccountCatalog creates rules only when thresholds are met', () => {
    const txs = [
      { title: 'Coffee', type: 0, account: 'acc-a' },
      { title: 'coffee beans', type: 0, account: 'acc-a' },
      { title: 'COFFEE shop', type: 0, account: 'acc-a' },
      { title: 'Tea', type: 0, account: 'acc-b' },
      { title: 'Tea', type: 0, account: 'acc-b' },
      { title: 'Transaction', type: 0, account: 'acc-c' }, // ignored
    ];

    const catalog = buildAutoAccountCatalog(txs);

    expect(catalog.rules[0].coffee).toBe('acc-a');
    expect(catalog.rules[0].tea).toBeUndefined(); // minCount=3 not met
  });

  test('suggestAccount returns the most probable account for the title', () => {
    const txs = [
      { title: 'coffee', type: 0, account: 'acc-a' },
      { title: 'coffee', type: 0, account: 'acc-a' },
      { title: 'coffee', type: 0, account: 'acc-a' },
      { title: 'rent', type: 0, account: 'acc-b' },
      { title: 'rent', type: 0, account: 'acc-b' },
      { title: 'rent', type: 0, account: 'acc-b' },
    ];

    const catalog = buildAutoAccountCatalog(txs);

    expect(suggestAccount(catalog, { title: 'coffee', type: 0 })).toBe('acc-a');
    expect(suggestAccount(catalog, { title: 'rent feb', type: 0 })).toBe('acc-b');
    expect(suggestAccount(catalog, { title: 'unknown', type: 0 })).toBeUndefined();
  });

  test('suggestAccount falls back across types when current type has no rule', () => {
    const txs = [
      { title: 'mirai s l', type: 1, account: 'acc-income' },
      { title: 'mirai', type: 1, account: 'acc-income' },
      { title: 'Mirai S.L.', type: 1, account: 'acc-income' },
    ];

    const catalog = buildAutoAccountCatalog(txs);

    // Ask for type=0 (expense): should still suggest the account learned in type=1.
    expect(suggestAccount(catalog, { title: 'mirai', type: 0 })).toBe('acc-income');
  });

  test('learnAutoAccount updates catalog incrementally', () => {
    const base = buildAutoAccountCatalog([]);
    const next = learnAutoAccount(base, { title: 'coffee', type: 0, account: 'acc-a' });
    const next2 = learnAutoAccount(next, { title: 'coffee', type: 0, account: 'acc-a' });
    const next3 = learnAutoAccount(next2, { title: 'coffee', type: 0, account: 'acc-a' });

    expect(suggestAccount(next3, { title: 'coffee', type: 0 })).toBe('acc-a');
  });
});
