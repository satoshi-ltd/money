import { tokenizeTitle } from '../autoTokens';

describe('modules/autoTokens', () => {
  test('an accented word stays one word, with the accent gone', () => {
    expect(tokenizeTitle('Farmácia São João')).toEqual(['farmacia', 'sao', 'joao']);
    expect(tokenizeTitle('Café für Zürich')).toEqual(['cafe', 'zurich']);
  });

  test('punctuation splits, short words and stop words drop', () => {
    expect(tokenizeTitle('Water bill (Sept.) for the house')).toEqual(['water', 'bill', 'sept', 'house']);
    expect(tokenizeTitle('')).toEqual([]);
    expect(tokenizeTitle(undefined)).toEqual([]);
  });
});
