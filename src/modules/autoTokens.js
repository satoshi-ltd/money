// Shared stop words for the languages we support (EN/ES/PT/FR/DE).
// Keep this list conservative: only common function words.
const STOP_WORDS = new Set([
  // English
  'a',
  'an',
  'and',
  'are',
  'at',
  'by',
  'for',
  'from',
  'in',
  'is',
  'it',
  'of',
  'on',
  'or',
  'the',
  'to',
  'with',

  // Spanish
  'con',
  'del',
  'las',
  'los',
  'por',
  'para',
  'que',
  'una',
  'uno',

  // Portuguese
  'com',
  'das',
  'dos',
  'para',
  'por',
  'que',
  'uma',
  'uns',

  // French
  'avec',
  'des',
  'les',
  'pour',
  'une',

  // German
  'der',
  'die',
  'das',
  'den',
  'und',
  'mit',
  'fur', // "fuer" without umlaut
  'von',
  'auf',
]);

export const tokenizeTitle = (title = '') => {
  if (!title || typeof title !== 'string') return [];
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length >= 3 && !STOP_WORDS.has(word));
};
