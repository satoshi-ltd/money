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
