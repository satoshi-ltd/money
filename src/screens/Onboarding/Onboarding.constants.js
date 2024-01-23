import { L10N } from '../../modules';

const SLIDES = [
  {
    title: L10N.WELCOME_TITLE,
    message: L10N.WELCOME_CAPTION,
    image: require('../../../assets/images/welcome.png'),
  },
  {
    title: L10N.ONBOARDING_COMPLETED_TITLE,
    message: L10N.ONBOARDING_COMPLETED_CAPTION,
    image: require('../../../assets/images/completed.png'),
    // image: require('../../../assets/images/bob-eve.png'),
  },
  {
    title: L10N.ONBOARDING_COMPLETED_TITLE,
    message: L10N.ONBOARDING_COMPLETED_CAPTION,
    image: require('../../../assets/images/completed.png'),
    // image: require('../../../assets/images/bob-eve.png'),
  },
  // {
  //   title: 'Unlock secure Secret safely.',
  //   message:
  //     "Alice's divided secret is now safe. With just 2 out of the 3 parts held by Bob and Eve, Alice knows her treasure is secure.",
  //   // image: require('../../../assets/images/alice-bob.png'),
  // },
  // {
  //   title: 'Join Alice with SecretQR.',
  //   message:
  //     "It's your turn. Just like Alice, discover the security offered by SecretQR. Safeguard your secrets effortlessly and reliably.",
  //   // image: require('../../../assets/images/alice-join.png'),
  // },
];

export { SLIDES };
