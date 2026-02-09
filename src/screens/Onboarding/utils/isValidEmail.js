export const isValidEmail = (email = '') => {
  const value = `${email || ''}`.trim();
  if (!value) return false;
  // Pragmatic validation: good enough for opt-in lead capture without false negatives.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};
