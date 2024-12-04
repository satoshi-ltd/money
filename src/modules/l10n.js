export const L10N = {
  ABOUT: 'About môney',
  ACCEPT: 'Accept',
  ACTIVITY: 'Analytics',

  APPERANCE_DARK: 'Switch to dark mode',
  APPERANCE_LIGHT: 'Switch to light mode',

  BACKUP_CAPTION:
    'Take control of your financial data, you own your {accounts} accounts and {txs} transactions. Safeguard your privacy and security while effortlessly managing your info, all with a simple tap.',
  BALANCE: 'Balance',

  CANCEL: 'Cancel',
  CATEGORIES: [
    {
      // Expenses
      1: 'Food & Drinks',
      7: 'Shopping',
      8: 'Home',
      13: 'Transit',
      9: 'Healthcare',
      15: 'Insurance',
      6: 'Leisure',
      3: 'Travel',
      4: 'Debt',
      5: 'Investment',
      10: 'Personal',
      11: 'Services',
      12: 'Transfer',
      14: 'Education',
      99: 'Swap',
    },
    {
      // Incomes
      1: 'Salary',
      5: 'Business',
      2: 'Investment',
      3: 'Passive',
      7: 'Royalties',
      8: 'Bonuses',
      4: 'Transfer',
      6: 'Retirement',
      9: 'Others',
      99: 'Swap',
    },
  ],
  CATEGORIES_AMOUNT: (amount) => `${amount} ${amount > 1 ? 'categories' : 'category'}`,

  CHANGE_DESTINATION: 'Change destination',
  CHOOSE_CURRENCY: 'Base currency',
  CHOOSE_PLAN: 'Choose your plan',
  CLONE: 'Clone',
  CLOSE: 'Close',
  CONCEPT: 'Concept',
  CONFIRM_DELETION: 'Confirm deletion',
  CONFIRM_DELETION_CAPTION: 'Confirm permanent deletion of this transaction? This action is irreversible.',
  CONFIRM_EXPORT_SUCCESS: 'Export successful! Your data has been saved.',
  CONFIRM_IMPORT: 'Confirm import',
  CONFIRM_IMPORT_CAPTION: ({ accounts = [], txs = [] }) =>
    `Ready to import the JSON file? It'll update your finances with ${accounts.length} accounts and ${txs.length} transactions. Just make sure the file is good to go—this action can't be undone!"`,
  CONFIRM_IMPORT_SUCCESS: 'Imported successfully.',
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

  DARK_MODE: 'Dark Mode',
  DELETE: 'Delete',
  DISABLE: 'Disable',

  ENABLE: 'Enable',
  ERROR: 'Something went wrong',
  ERROR_EXPORT: 'Unable to export as you don’t have sharing permissions.',
  ERROR_IMPORT: 'The file format is not supported. Please choose a compatible file type.',
  ERROR_PRODUCTS: 'Products not found',
  ERROR_PURCHASE: 'Purchase failed',
  ERROR_RESTORE: 'Restore failed',
  ERROR_SERVICE_RATES: 'Something was wrong trying to get updated currencies rates. Check that you are online.',
  ERROR_TRY_AGAIN: 'Something wrong happened. Try again.',
  EXPENSE: 'Expense',
  EXPENSES: 'Expenses',
  EXPORT: 'Export',
  EXPORT_DATA: 'Export Data',
  EXPORT_DATA_CAPTION: 'JSON archive',

  FIRST_ACCOUNT: 'Your first account',
  FIRST_ACCOUNT_CAPTION: 'Choose your main currency. Add more accounts later, each supporting different currencies.',

  GENERAL: 'General',
  GET_MONEY_PREMIUM: 'Get môney Premium',

  IMPORT: 'Import',
  IMPORT_DATA: 'Import Data',
  IMPORT_DATA_CAPTION: 'JSON archive',
  INCOME: 'Income',
  INCOMES: 'Incomes',
  INITIAL_BALANCE: 'Initial balance',

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
  NEXT: 'Next',
  NO_TRANSACTIONS: "You don't have any transaction.",

  ONBOARDING_FINANCES: 'Your Finances Anywhere',
  ONBOARDING_FINANCES_CAPTION:
    'Access your accounts and make transactions from your mobile phone, no matter where you are.',
  ONBOARDING_PRIVACY: 'Privacy First',
  ONBOARDING_PRIVACY_CAPTION:
    'Protect your personal data with Money, which doesn’t collect or share information with third parties.',
  ONBOARDING_SIMPLIFY: 'Simplify Your Finances',
  ONBOARDING_SIMPLIFY_CAPTION:
    'Money has built-in intelligence that informs you about how you use your money and helps you make more informed financial decisions.',
  ONBOARDING_WELCOME: 'Welcome to Money!',
  ONBOARDING_WELCOME_CAPTION: 'Explore seamless and secure management of your multicurrency accounts. Welcome aboard!',
  OVERALL_BALANCE: 'Overall Balance',

  PIN: 'Your PIN code',
  PIN_CHOOSE: 'Choose PIN code',
  PREFERENCES: 'Preferences',
  PURCHASE: 'Purchase',
  PURCHASE_RESTORED: 'Purchase restored.',

  REMINDERS: 'Reminders',
  RESTORE_PURCHASES: 'Restore purchases',

  SAVE: 'Save',
  SCHEDULE_BACKUP: 'Time to Secure Your Finances!',
  SCHEDULE_BACKUP_CAPTION:
    "Don't forget to perform your weekly backup. Keep your financial information safe and up-to-date. It's quick and easy. Do it now!",
  SEARCH: 'Search',
  SETTINGS: 'Settings',
  START: 'Start',
  START_TRIAL: 'Start free 7 day trial',
  SUBSCRIPTION: 'Subscription',
  SUBSCRIPTION_CAPTION: 'No restrictions on accounts and transactions, plus a robust import/export feature.',
  SUBSCRIPTION_CLOSE: 'No thanks',
  SUBSCRIPTION_TERMS: 'Terms',
  SUBSCRIPTION_TERMS_CAPTION:
    'By tapping "Start free 7 day trial", you will not be charged for the next 7 days, your subscription will auto-renew for the same price and package length until you cancel via App Store Settings. and you agree to our',
  SYNC_RATES_SENTENCE: 'Last update on',
  SYNC_RATES_CTA: 'Update Rates',
  SWAP: 'Swap',

  TERMS: 'Terms',
  TERMS_AND_CONDITIONS: [
    {
      title: '1. Acceptance of Terms',
      caption:
        'By accessing or using our application, you agree to be bound by these Terms and Conditions, as well as our Privacy Policy. If you do not agree with any of the terms outlined here, please refrain from using the application.',
    },
    {
      title: '2. Responsible Use',
      caption:
        'Our application is designed to provide personal finance services. By using it, you commit to using it responsibly and in compliance with all applicable laws and regulations.',
    },
    {
      title: '3. Privacy and Security',
      caption:
        'We prioritize your privacy. Our Privacy Policy outlines how we collect, store, and use your data. By using the application, you consent to our privacy and security practices.',
    },
    {
      title: '4. No Data Storage',
      caption:
        'We want to assure you that we do not store any user data. Our application is secure and private, and we do not offer any cloud-based systems. Your financial information remains on your device for your privacy and security.',
    },
    {
      title: '5. Financial Transactions',
      caption:
        'The application may enable you to conduct financial transactions. By doing so, you agree to take responsibility for all transactions and ensure the accuracy of the provided information.',
    },
    {
      title: '6. User Responsibility',
      caption:
        'You are responsible for maintaining the confidentiality of your account and password. Any activity carried out with your account will be considered as performed by you.',
    },
    {
      title: '7. Changes to Terms',
      caption:
        'We reserve the right to modify these Terms and Conditions at any time. Changes will become effective immediately upon publication. It is your responsibility to periodically review these terms.',
    },
    {
      title: '8. Contact',
      caption:
        'If you have any questions or comments about these Terms and Conditions, please contact us at [your contact email].',
    },
  ],
  TERMS_AND_CONDITIONS_CAPTION:
    'Welcome to Money, your rules: Manage, Save, Succeed. Before using our application, we urge you to carefully read the following terms and conditions.',
  TERMS_AND_CONDITIONS_TITLE: 'Terms and Conditions',
  TODAY: 'Today',
  TRANSACTION: ['Expense', 'Income', 'Swap'],
  TRANSACTIONS: 'Transactions',
  TRANSFERS: 'Transfers',

  ACCOUNT: 'Account',
  ACCOUNTS: 'Accounts',

  WAIT: 'Syncing...',
};
