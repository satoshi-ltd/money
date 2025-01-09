import StyleSheet from 'react-native-extended-stylesheet';

import { IMAGE_SIZE } from './Onboarding.constants';

export const style = StyleSheet.create({
  screen: {
    height: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },

  slide: {
    alignItems: 'flex-start',
    flex: 1,
    gap: '$spaceL',
    justifyContent: 'flex-end',
    padding: '$spaceXL',
  },

  image: {
    height: IMAGE_SIZE * 1.2,
    marginBottom: '$viewOffset',
    width: IMAGE_SIZE,
  },

  footer: {
    alignItems: 'center',
    paddingBottom: '$spaceXL',
    paddingHorizontal: '$spaceXL',
    paddingTop: '$viewOffset',
    justifyContent: 'space-between',
  },

  button: {
    width: '33%',
  },
});
