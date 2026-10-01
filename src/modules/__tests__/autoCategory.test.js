import { buildAutoCategoryCatalog, suggestCategory } from '../autoCategory';
import { C } from '../constants';

const { EXPENSE } = C.TX.TYPE;
const { INTERNAL_TRANSFER } = C;

const transferLeg = { title: 'Savings', type: EXPENSE, category: INTERNAL_TRANSFER };
const groceries = { title: 'Market groceries', type: EXPENSE, category: 1 };

describe('modules/autoCategory', () => {
  test('builds a rule from ordinary transactions', () => {
    const catalog = buildAutoCategoryCatalog([groceries, groceries, groceries]);

    expect(catalog.rules[EXPENSE].market).toBe(1);
  });

  test('a catalog built from nothing has no rules to suggest from', () => {
    expect(suggestCategory(buildAutoCategoryCatalog([]), { title: 'Market groceries', type: EXPENSE })).toBeUndefined();
  });

  test('a deleted or edited entry leaves the rule with it, since the catalog is rebuilt from what is there', () => {
    const history = [groceries, groceries, groceries];

    expect(buildAutoCategoryCatalog(history).rules[EXPENSE].market).toBe(1);
    expect(buildAutoCategoryCatalog(history.slice(1)).rules[EXPENSE].market).toBeUndefined();
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
