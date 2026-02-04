import { C, ICON, L10N } from '../../modules';

const { PRIVACY_URL, TERMS_URL } = C;

const OPTIONS = (isPremium, subscription) => [
  {
    callback: !isPremium ? 'handleSubscription' : undefined,
    caption: isPremium
      ? subscription?.productIdentifier?.split('.')?.[0] === 'lifetime'
        ? L10N.PREMIUM_LIFETIME
        : L10N.PREMIUM_YEARLY
      : undefined,
    icon: ICON.STAR,
    id: 1,
    text: L10N.SUBSCRIPTION,
  },
  {
    callback: 'handleUpdateRates',
    caption: L10N.IMPORT_DATA_CAPTION,
    icon: ICON.UPDATE,
    id: 2,
    text: L10N.SYNC_RATES_CTA,
  },
  {
    callback: 'handleExport',
    caption: L10N.EXPORT_DATA_CAPTION,
    icon: ICON.DOWNLOAD,
    id: 3,
    text: L10N.EXPORT_DATA,
  },
  {
    callback: 'handleImport',
    caption: L10N.IMPORT_DATA_CAPTION,
    icon: ICON.UPLOAD,
    id: 4,
    text: L10N.IMPORT_DATA,
  },
];

const PREFERENCES = () => [
  {
    icon: ICON.SWAP,
    screen: 'baseCurrency',
    text: L10N.CHOOSE_CURRENCY,
  },
];

const ABOUT = (isPremium) => [
  ...(!isPremium
    ? [
        {
          callback: 'handleSubscription',
          icon: ICON.STAR,
          text: L10N.GET_MONEY_PREMIUM,
        },
      ]
    : []),
  ...(!isPremium
    ? [
        {
          callback: 'handleRestorePurchases',
          icon: ICON.CART,
          text: L10N.RESTORE_PURCHASES,
        },
      ]
    : []),
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

export { ABOUT, OPTIONS, PREFERENCES };
