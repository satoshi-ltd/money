import { C, L10N } from '../../modules';

const { PRIVACY_URL, TERMS_URL } = C;

const DATA = () => [
  {
    callback: 'handleUpdateRates',
    id: 1,
    text: L10N.SYNC_RATES_CTA,
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
];

export { ABOUT, APPEARANCE_OPTIONS, DATA, LANGUAGE_OPTIONS };
