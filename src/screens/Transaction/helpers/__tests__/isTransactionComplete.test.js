import { isTransactionComplete } from '../isTransactionComplete';

const complete = { category: 10, title: 'Coffee', value: '40' };

describe('screens/Transaction/helpers/isTransactionComplete', () => {
  test('a title, an amount and a category make a transaction', () => {
    expect(isTransactionComplete(complete)).toBe(true);
    expect(isTransactionComplete({ ...complete, value: 12.5 })).toBe(true);
  });

  test('a blank title is no title', () => {
    expect(isTransactionComplete({ ...complete, title: '' })).toBe(false);
    expect(isTransactionComplete({ ...complete, title: '   ' })).toBe(false);
    expect(isTransactionComplete({ ...complete, title: undefined })).toBe(false);
  });

  test('the amount has to be a positive number, typed or not', () => {
    expect(isTransactionComplete({ ...complete, value: '0' })).toBe(false);
    expect(isTransactionComplete({ ...complete, value: 'abc' })).toBe(false);
    expect(isTransactionComplete({ ...complete, value: undefined })).toBe(false);
    expect(isTransactionComplete({ ...complete, value: '-3' })).toBe(false);
  });

  test('the category counts only where the form shows one', () => {
    expect(isTransactionComplete({ ...complete, category: undefined })).toBe(false);
    expect(isTransactionComplete({ ...complete, category: undefined }, { showCategory: false })).toBe(true);
    expect(isTransactionComplete(undefined)).toBe(false);
  });
});
