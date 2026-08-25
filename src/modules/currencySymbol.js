import { C } from './constants';

const { SYMBOL } = C;

// A glyph belongs to the first currency that claims it; the rest would be ambiguous, so they use their code.
const CLAIMED = new Map();
const AMBIGUOUS = new Set();
Object.entries(SYMBOL).forEach(([code, glyph]) => {
  if (CLAIMED.has(glyph)) AMBIGUOUS.add(code);
  else CLAIMED.set(glyph, code);
});

export const currencySymbol = (currency) => {
  if (!currency) return '';
  return AMBIGUOUS.has(currency) ? currency : SYMBOL[currency] || currency;
};

// An amount already denominated in the currency the reader thinks in needs no mark. Kept beside the symbol
// itself so the two cannot drift: the pickers still want a glyph for every currency, amounts do not.
export const foreignSymbol = (currency, baseCurrency) =>
  currency && currency !== baseCurrency ? currencySymbol(currency) : '';
