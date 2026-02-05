import { StyleSheet } from 'react-native';

import { IMAGE_SIZE } from './Onboarding.constants';
import { theme } from '../../theme';
import { viewOffset } from '../../theme/layout';

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
    gap: theme.spacing.lg,
    justifyContent: 'flex-end',
    padding: theme.spacing.xl,
  },

  image: {
    height: IMAGE_SIZE * 1.2,
    marginBottom: viewOffset,
    width: IMAGE_SIZE,
  },

  footer: {
    alignItems: 'center',
    paddingBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: viewOffset,
    justifyContent: 'space-between',
  },

  button: {
    width: '33%',
  },
});
