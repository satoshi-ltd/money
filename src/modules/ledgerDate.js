// The order is the ledger's — weekday, day, month, year — while the names follow the reader's language.
export const ledgerDate = (date = new Date(), locale = 'en-US') => {
  const resolved = date instanceof Date ? date : new Date(date);
  const parts = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    weekday: 'short',
    year: 'numeric',
  }).formatToParts(resolved);
  const pick = (type) => parts.find((part) => part.type === type)?.value.replace(/[.,]/g, '') ?? '';

  return [pick('weekday'), pick('day'), pick('month'), pick('year')].filter(Boolean).join(' ');
};
