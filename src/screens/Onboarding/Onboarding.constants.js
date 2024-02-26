import { L10N } from '../../modules';

const IMAGE_SIZE = 354;

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
];

export { IMAGE_SIZE, SLIDES };
