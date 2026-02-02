import { L10N } from '../modules/l10n';

let currentLanguage = 'en';
const dictionaries = { en: L10N };

export const setLanguage = async (language) => {
  currentLanguage = language || 'en';
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
  const dict = dictionaries[currentLanguage] || dictionaries.en || {};
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
