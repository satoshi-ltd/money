import { C, ICON, L10N } from '../../modules';

const { PRIVACY_URL, TERMS_URL } = C;

const PREMIUM = (isPremium, subscription) => [
  {
    callback: 'handleSubscription',
    caption: isPremium
      ? subscription?.productIdentifier?.split('.')?.[0] === 'lifetime'
        ? L10N.PREMIUM_LIFETIME
        : L10N.PREMIUM_YEARLY
      : undefined,
    icon: ICON.STAR,
    id: 1,
    text: L10N.SUBSCRIPTION,
  },
  // Restore purchases is only relevant when not premium.
  ...(!isPremium
    ? [
        {
          callback: 'handleRestorePurchases',
          icon: ICON.CART,
          id: 2,
          text: L10N.RESTORE_PURCHASES,
        },
      ]
    : []),
];

const DATA = () => [
  {
    callback: 'handleUpdateRates',
    icon: ICON.UPDATE,
    id: 1,
    text: L10N.SYNC_RATES_CTA,
  },
  {
    callback: 'handleExport',
    icon: ICON.BACKUP,
    id: 2,
    text: L10N.EXPORT_DATA,
  },
  {
    callback: 'handleImport',
    icon: ICON.RESTORE,
    id: 3,
    text: L10N.IMPORT_DATA,
  },
  {
    callback: 'handleExportCsv',
    icon: ICON.CSV,
    id: 4,
    text: L10N.EXPORT_CSV,
  },
];

const PREFERENCES = () => [
  {
    icon: ICON.SWAP,
    screen: 'baseCurrency',
    text: L10N.CHOOSE_CURRENCY,
  },
];

const ABOUT = () => [
  {
    icon: ICON.FILE,
    url: TERMS_URL,
    text: L10N.TERMS,
  },
  {
    icon: ICON.FILE,
    url: PRIVACY_URL,
    text: L10N.PRIVACY,
  },
];

export { ABOUT, DATA, PREMIUM, PREFERENCES };
