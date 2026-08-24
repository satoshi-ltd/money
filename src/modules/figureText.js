// U+2009: the artboards set a thin space before % and the currency symbol, not a word space.
const THIN_SPACE = ' ';

export const percentText = (value, { decimals = 0, signed = false } = {}) => {
  if (!Number.isFinite(value)) return '';

  const sign = signed ? (value > 0 ? '+' : '−') : '';
  const amount = signed ? Math.abs(value) : value;

  return `${sign}${amount.toFixed(decimals)}${THIN_SPACE}%`;
};

export const withThinSpace = (value) => `${THIN_SPACE}${value}`;
