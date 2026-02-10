import { buildAutoAmountCatalog, learnAutoAmount, suggestAmount } from '../autoAmount';

describe('autoAmount', () => {
  test('suggestAmount returns amount only when stable', () => {
    const txs = [
      { title: 'Mirai S.L.', type: 1, account: 'acc-income', value: 6121 },
      { title: 'Mirai S.L.', type: 1, account: 'acc-income', value: 6121 },
      { title: 'Mirai S.L.', type: 1, account: 'acc-income', value: 6121 },
    ];

    const catalog = buildAutoAmountCatalog(txs);

    expect(suggestAmount(catalog, { title: 'mirai', type: 1, account: 'acc-income' })).toBe('6121');
  });

  test('suggestAmount returns undefined when not stable (no suggestions)', () => {
    const txs = [
      { title: 'Mirai S.L.', type: 1, account: 'acc-income', value: 6121 },
      { title: 'Mirai S.L.', type: 1, account: 'acc-income', value: 6138 },
      { title: 'Mirai S.L.', type: 1, account: 'acc-income', value: 6122 },
      { title: 'Mirai S.L.', type: 1, account: 'acc-income', value: 6121 },
    ];

    const catalog = buildAutoAmountCatalog(txs);

    expect(suggestAmount(catalog, { title: 'mirai', type: 1, account: 'acc-income' })).toBeUndefined();
  });

  test('learnAutoAmount updates catalog incrementally', () => {
    const base = buildAutoAmountCatalog([]);
    const next = learnAutoAmount(base, { title: 'rent', type: 0, account: 'acc-a', value: 1000 });
    const next2 = learnAutoAmount(next, { title: 'rent', type: 0, account: 'acc-a', value: 1000 });
    const next3 = learnAutoAmount(next2, { title: 'rent', type: 0, account: 'acc-a', value: 1000 });

    expect(suggestAmount(next3, { title: 'rent', type: 0, account: 'acc-a' })).toBe('1000');
  });
});
