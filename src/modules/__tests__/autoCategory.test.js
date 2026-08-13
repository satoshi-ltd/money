import { buildAutoCategoryCatalog, learnAutoCategory, suggestCategory } from '../autoCategory';
import { C } from '../constants';

const { EXPENSE } = C.TX.TYPE;
const { INTERNAL_TRANSFER } = C;

const transferLeg = { title: 'Savings', type: EXPENSE, category: INTERNAL_TRANSFER };
const groceries = { title: 'Market groceries', type: EXPENSE, category: 1 };

describe('modules/autoCategory', () => {
  test('learns from ordinary transactions', () => {
    const catalog = [groceries, groceries, groceries].reduce((memo, tx) => learnAutoCategory(memo, tx), undefined);

    expect(catalog.rules[EXPENSE].market).toBe(1);
  });

  test('never learns a category from an internal transfer', () => {
    const catalog = [transferLeg, transferLeg, transferLeg, transferLeg].reduce(
      (memo, tx) => learnAutoCategory(memo, tx),
      undefined,
    );

    expect(catalog).toBeUndefined();
  });

  test('leaves transfers out when the catalog is rebuilt from history', () => {
    const catalog = buildAutoCategoryCatalog([transferLeg, transferLeg, transferLeg, groceries, groceries, groceries]);

    expect(catalog.rules[EXPENSE].savings).toBeUndefined();
    expect(catalog.rules[EXPENSE].market).toBe(1);
  });

  test('does not suggest the transfer category for a title seen only in transfers', () => {
    const catalog = buildAutoCategoryCatalog([transferLeg, transferLeg, transferLeg]);

    expect(suggestCategory(catalog, { title: 'Savings', type: EXPENSE })).toBeUndefined();
  });
});
