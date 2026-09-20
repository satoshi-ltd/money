import { C, L10N, TEXT_SCALES } from '../../modules';

const { PRIVACY_URL, SECURITY_URL, TERMS_URL } = C;

const DATA = () => [
  {
    callback: 'handleUpdateRates',
    id: 1,
    text: L10N.SYNC_RATES_CTA,
  },
  {
    callback: 'handleExport',
    id: 2,
    text: L10N.EXPORT_DATA,
  },
  {
    callback: 'handleImport',
    id: 3,
    text: L10N.IMPORT_DATA,
  },
  {
    callback: 'handleExportCsv',
    id: 4,
    text: L10N.EXPORT_CSV,
  },
];

const APPEARANCE_OPTIONS = [
  { label: L10N.APPEARANCE_SYSTEM, symbol: '◐', symbolSize: 'lg', value: 'system' },
  { label: L10N.APPEARANCE_LIGHT, symbol: '○', symbolSize: 'lg', value: 'light' },
  { label: L10N.APPEARANCE_DARK, symbol: '●', symbolSize: 'lg', value: 'dark' },
];

// A function, not a constant: L10N reads the language at call time, and a constant freezes the labels at boot.
const TEXT_SIZE_OPTIONS = () => {
  const labels = [L10N.TEXT_SIZE_SMALL, L10N.TEXT_SIZE_DEFAULT, L10N.TEXT_SIZE_LARGE, L10N.TEXT_SIZE_LARGEST];
  const symbolSizes = ['xs', 'sm', 'md', 'lg'];

  return TEXT_SCALES.map((value, index) => ({
    label: labels[index],
    symbol: 'A',
    symbolSize: symbolSizes[index],
    value,
  }));
};

const LANGUAGE_OPTIONS = [
  { label: 'English', symbol: 'EN', value: 'en' },
  { label: 'Español', symbol: 'ES', value: 'es' },
  { label: 'Português', symbol: 'PT', value: 'pt' },
  { label: 'Français', symbol: 'FR', value: 'fr' },
  { label: 'Deutsch', symbol: 'DE', value: 'de' },
];

const ABOUT = () => [
  {
    url: TERMS_URL,
    text: L10N.TERMS,
  },
  {
    url: PRIVACY_URL,
    text: L10N.PRIVACY,
  },
  {
    url: SECURITY_URL,
    text: L10N.SECURITY,
  },
];

export { ABOUT, APPEARANCE_OPTIONS, DATA, LANGUAGE_OPTIONS, TEXT_SIZE_OPTIONS };
