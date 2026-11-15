import { amountText, parseAmount } from '../parseAmount';

describe('modules/parseAmount', () => {
  test.each([
    ['12.5', 12.5],
    ['12,5', 12.5],
    ['1200,50', 1200.5],
    ['8412.90', 8412.9],
    ['12,', 12],
    ['12.5.', 12.5],
    [' 7 ', 7],
    [3, 3],
  ])('reads %p as %p', (raw, expected) => {
    expect(parseAmount(raw)).toBe(expected);
  });

  test.each(['', 'abc', '12,5,3', '1.200,50', '-3', undefined, null, NaN, Infinity])('rejects %p', (raw) => {
    expect(parseAmount(raw)).toBeUndefined();
  });

  test('a signed read keeps the minus of a debt and still rejects text', () => {
    expect(parseAmount('-50', { signed: true })).toBe(-50);
    expect(parseAmount('-1200,50', { signed: true })).toBe(-1200.5);
    expect(parseAmount('--5', { signed: true })).toBeUndefined();
  });

  test('amountText hands the form a dot decimal and refuses what is not an amount', () => {
    expect(amountText('12,5')).toBe('12.5');
    expect(amountText('12x')).toBeUndefined();
    expect(amountText(12)).toBeUndefined();
  });
});
