import { EN, ES, PT, FR, DE } from './dictionaries';

let currentLanguage = 'en';
const dictionaries = { en: EN, es: ES, pt: PT, fr: FR, de: DE };

const normalizeLanguage = (language) => {
  if (!language) return 'en';
  const value = `${language}`.toLowerCase();
  return value.includes('-') ? value.split('-')[0] : value;
};

export const getDictionary = (language = currentLanguage) => {
  const normalized = normalizeLanguage(language);
  return dictionaries[normalized] || dictionaries.en;
};

export const getFallbackDictionary = () => dictionaries.en;

export const L10N = new Proxy(
  {},
  {
    get: (_, key) => {
      if (typeof key !== 'string') return undefined;
      const dict = getDictionary(currentLanguage);
      if (dict && dict[key] !== undefined) return dict[key];
      const fallback = getFallbackDictionary();
      return fallback[key] !== undefined ? fallback[key] : key;
    },
  },
);

export const setLanguage = async (language) => {
  currentLanguage = normalizeLanguage(language);
};

export const detectDeviceLanguage = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale || 'en';
  } catch {
    return 'en';
  }
};

const interpolate = (value, params = {}) => {
  if (typeof value !== 'string') return value;
  return value.replace(/\{(\w+)\}/g, (_, key) => (params[key] !== undefined ? params[key] : `{${key}}`));
};

export const translate = (key, params = {}) => {
  const dict = getDictionary(currentLanguage) || {};
  const value = dict[key];
  if (typeof value === 'function') return value(params);
  if (value === undefined) return key;
  return interpolate(value, params);
};

export const formatDateTime = (date, locale = currentLanguage, options = {}) => {
  try {
    return new Intl.DateTimeFormat(locale, options).format(date);
  } catch {
    return `${date}`;
  }
};
