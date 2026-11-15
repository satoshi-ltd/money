const AMOUNT = /^[0-9]+([,.][0-9]+)?[,.]?$/;
const SIGNED_AMOUNT = /^-?[0-9]+([,.][0-9]+)?[,.]?$/;

export const amountText = (raw) => {
  const text = typeof raw === 'string' ? raw.trim() : '';
  return AMOUNT.test(text) ? text.replace(',', '.') : undefined;
};

export const parseAmount = (raw, { signed = false } = {}) => {
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : undefined;
  const text = typeof raw === 'string' ? raw.trim() : '';
  return (signed ? SIGNED_AMOUNT : AMOUNT).test(text) ? parseFloat(text.replace(',', '.')) : undefined;
};
