export const L10N = {
  ACCEPT: 'Accept',
  ACTIVITY: 'Analytics',

  BALANCE: 'Balance',

  CANCEL: 'Cancel',
  CATEGORIES: [
    {
      // Expenses
      1: 'Food & Drinks',
      3: 'Travel',
      4: 'Debt',
      5: 'Investment',
      6: 'Entertainment',
      7: 'Shopping',
      8: 'Utilities',
      9: 'Healthcare',
      10: 'Personal',
      11: 'Services',
      12: 'Transfer',
      13: 'Others',
      99: 'Swap',
    },
    {
      // Incomes
      1: 'Salary',
      2: 'Investment',
      3: 'Pasives',
      4: 'Transfer',
      5: 'Others',
      99: 'Swap',
    },
  ],
  CHANGE_DESTINATION: 'Change destination',
  CHOOSE_CURRENCY: 'Base currency',
  CLONE: 'Clone',
  CLOSE: 'Close',
  CONCEPT: 'Concept',
  CONFIRM_DELETION: 'Confirm deletion',
  CONFIRM_DELETION_CAPTION: 'Confirm permanent deletion of this transaction? This action is irreversible.',
  CONFIRM_IMPORT: 'Confirm import',
  CONFIRM_IMPORT_CAPTION: ({ accounts = [], txs = [] }) =>
    `Ready to import the JSON file? It'll update your finances with ${accounts.length} accounts and ${txs.length} transactions. Just make sure the file is good to go—this action can't be undone!"`,
  CURRENCY: 'Currency',
  CURRENCY_NAME: {
    AUD: 'Australian Dollar',
    BTC: 'Bitcoin',
    CNY: 'Chinese Yuan',
    GBP: 'British Pound',
    ETH: 'Ethereum',
    EUR: 'Euro',
    HKD: 'Hong Kong Dollar',
    JPY: 'Japanese Yen',
    KRW: 'South Korean Won',
    MXN: 'Mexican Peso',
    MYR: 'Malaysian Ringgit',
    RUB: 'Russian Ruble',
    SGD: 'Singapore Dollar',
    THB: 'Thailand Baht',
    USD: 'USA Dollar',
    VND: 'Vietnamese Dong',
    XAU: 'Gold',
    XAG: 'Silver',
  },
  CURRENCIES: 'Currencies',

  DAY_NAMES: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  DELETE: 'Delete',
  DISABLE: 'Disable',

  ENABLE: 'Enable',
  ERROR_SERVICE_RATES: 'Something was wrong trying to get updated currencies rates. Check that you are online.',
  EXPENSE: 'Expense',
  EXPENSES: 'Expenses',
  EXPORT: 'Export',

  FIRST_ACCOUNT: 'Your first account',
  FIRST_ACCOUNT_CAPTION: 'Choose your main currency. Add more accounts later, each supporting different currencies.',

  IMPORT: 'Import',
  INCOME: 'Income',
  INCOMES: 'Incomes',
  INITIAL_BALANCE: 'Initial balance',
  INVESTMENTS: 'Investments',

  LAST_TRANSACTIONS: 'Recent activity',

  MONTHS: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],

  NAME: 'Name',
  NEW: 'New',
  NO_TRANSACTIONS: "You don't have any transaction.",

  OVERALL_BALANCE: 'Overall Balance',

  PIN: 'Your PIN code',
  PIN_CHOOSE: 'Choose PIN code',

  SAVE: 'Save',
  SCHEDULE_BACKUP: 'Time to Secure Your Finances!',
  SCHEDULE_BACKUP_CAPTION:
    "Don't forget to perform your weekly backup. Keep your financial information safe and up-to-date. It's quick and easy. Do it now!",
  SEARCH: 'Search',
  SETTINGS: 'Settings',
  SYNC_RATES_SENTENCE: 'Last update on',
  SYNC_RATES_CTA: 'Update Rates',
  SWAP: 'Swap',

  TODAY: 'Today',
  TRANSACTION: ['Expense', 'Income', 'Swap'],
  TRANSACTIONS: 'Transactions',
  TRANSFERS: 'Transfers',

  ACCOUNT: 'Account',
  ACCOUNTS: 'Accounts',

  WAIT: 'Syncing...',
};
