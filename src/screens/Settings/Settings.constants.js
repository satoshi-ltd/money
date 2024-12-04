import { ICON, L10N } from '../../modules';

const OPTIONS = [
  {
    callback: 'handleSubscription',
    // caption: '$$No active subscription',
    icon: ICON.STAR,
    id: 1,
    text: L10N.SUBSCRIPTION,
  },
  {
    callback: 'handleUpdateRates',
    caption: L10N.IMPORT_DATA_CAPTION,
    icon: ICON.UPLOAD,
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

const PREFERENCES = [
  {
    disabled: true,
    icon: ICON.BELL,
    screen: 'reminders',
    text: L10N.REMINDERS,
  },
];

const ABOUT = [
  {
    callback: 'handleSubscription',
    icon: ICON.STAR,
    text: L10N.GET_MONEY_PREMIUM,
  },
  {
    disabled: true,
    callback: 'handleRestorePurchases',
    icon: ICON.CART,
    text: L10N.RESTORE_PURCHASES,
  },
  {
    icon: ICON.FILE,
    screen: 'terms',
    text: L10N.TERMS,
  },
];

export { ABOUT, OPTIONS, PREFERENCES };
