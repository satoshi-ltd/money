import { L10N } from '../../modules';

const IMAGE_SIZE = 354;

const DEFAULT_SURVEY_DATA = {
  primaryGoal: '',
  trackingFrequency: '',
  detailLevel: '',
  accountsCount: '',
  incomePattern: '',
  premiumInterest: '',
  email: '',
};

const SLIDES = [
  {
    title: L10N.ONBOARDING_WELCOME,
    message: L10N.ONBOARDING_WELCOME_CAPTION,
    image: require('../../../assets/images/onboarding-1.png'),
  },
  {
    title: L10N.ONBOARDING_PRIVACY,
    message: L10N.ONBOARDING_PRIVACY_CAPTION,
    image: require('../../../assets/images/onboarding-2.png'),
  },
  {
    title: L10N.ONBOARDING_FINANCES,
    message: L10N.ONBOARDING_FINANCES_CAPTION,
    image: require('../../../assets/images/onboarding-3.png'),
  },

  {
    title: L10N.ONBOARDING_SIMPLIFY,
    message: L10N.ONBOARDING_SIMPLIFY_CAPTION,
    image: require('../../../assets/images/onboarding-4.png'),
  },
  // ---- profile survey (local-only)
  {
    type: 'primaryGoal',
    title: L10N.ONBOARDING_Q_PRIMARY_GOAL_TITLE,
    description: L10N.ONBOARDING_Q_PRIMARY_GOAL_CAPTION,
    options: [
      { label: L10N.ONBOARDING_OPT_PRIMARY_GOAL_SPENDING, value: 'spending' },
      { label: L10N.ONBOARDING_OPT_PRIMARY_GOAL_SAVINGS, value: 'savings' },
      { label: L10N.ONBOARDING_OPT_PRIMARY_GOAL_DEBT, value: 'debt' },
      { label: L10N.ONBOARDING_OPT_PRIMARY_GOAL_INCOME, value: 'income' },
      { label: L10N.ONBOARDING_OPT_PRIMARY_GOAL_TRAVEL, value: 'travel' },
    ],
  },
  {
    type: 'trackingFrequency',
    title: L10N.ONBOARDING_Q_TRACKING_FREQUENCY_TITLE,
    description: L10N.ONBOARDING_Q_TRACKING_FREQUENCY_CAPTION,
    options: [
      { label: L10N.ONBOARDING_OPT_FREQUENCY_DAILY, value: 'daily' },
      { label: L10N.ONBOARDING_OPT_FREQUENCY_WEEKLY, value: 'weekly' },
      { label: L10N.ONBOARDING_OPT_FREQUENCY_MONTH_END, value: 'month-end' },
      { label: L10N.ONBOARDING_OPT_FREQUENCY_OCCASIONAL, value: 'occasional' },
    ],
  },
  {
    type: 'detailLevel',
    title: L10N.ONBOARDING_Q_DETAIL_LEVEL_TITLE,
    description: L10N.ONBOARDING_Q_DETAIL_LEVEL_CAPTION,
    options: [
      { label: L10N.ONBOARDING_OPT_DETAIL_SIMPLE, value: 'simple' },
      { label: L10N.ONBOARDING_OPT_DETAIL_NORMAL, value: 'normal' },
      { label: L10N.ONBOARDING_OPT_DETAIL_DETAILED, value: 'detailed' },
    ],
  },
  {
    type: 'accountsCount',
    title: L10N.ONBOARDING_Q_ACCOUNTS_COUNT_TITLE,
    description: L10N.ONBOARDING_Q_ACCOUNTS_COUNT_CAPTION,
    options: [
      { label: L10N.ONBOARDING_OPT_ACCOUNTS_1, value: '1' },
      { label: L10N.ONBOARDING_OPT_ACCOUNTS_2_3, value: '2-3' },
      { label: L10N.ONBOARDING_OPT_ACCOUNTS_4_PLUS, value: '4+' },
    ],
  },
  {
    type: 'incomePattern',
    title: L10N.ONBOARDING_Q_INCOME_PATTERN_TITLE,
    description: L10N.ONBOARDING_Q_INCOME_PATTERN_CAPTION,
    options: [
      { label: L10N.ONBOARDING_OPT_INCOME_FIXED, value: 'fixed' },
      { label: L10N.ONBOARDING_OPT_INCOME_WEEKLY, value: 'weekly' },
      { label: L10N.ONBOARDING_OPT_INCOME_VARIABLE, value: 'variable' },
      { label: L10N.ONBOARDING_OPT_INCOME_MIXED, value: 'mixed' },
    ],
  },
  {
    type: 'premiumInterest',
    title: L10N.ONBOARDING_Q_PREMIUM_INTEREST_TITLE,
    description: L10N.ONBOARDING_Q_PREMIUM_INTEREST_CAPTION,
    options: [
      { label: L10N.ONBOARDING_OPT_PREMIUM_EXPORT, value: 'export' },
      { label: L10N.ONBOARDING_OPT_PREMIUM_INSIGHTS, value: 'insights' },
      { label: L10N.ONBOARDING_OPT_PREMIUM_AUTOMATIONS, value: 'automations' },
      { label: L10N.ONBOARDING_OPT_PREMIUM_UNSURE, value: 'unsure' },
    ],
  },
  {
    type: 'lead',
    title: L10N.ONBOARDING_LEAD_TITLE,
    description: L10N.ONBOARDING_LEAD_CAPTION,
  },
];

export { DEFAULT_SURVEY_DATA, IMAGE_SIZE, SLIDES };
