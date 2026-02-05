import { Dimensions, StyleSheet } from 'react-native';

import { theme } from '../../theme';
import { viewOffset } from '../../theme/layout';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  banner: {
    gap: theme.spacing.lg,
    maxWidth: width * 0.8,
    padding: theme.spacing.xl,
    width: width * 0.8,
  },
  left: {
    alignItems: 'flex-start',
    alignSelf: 'flex-start',
  },
  center: {
    alignItems: 'center',
    alignSelf: 'center',
  },
  right: {
    alignItems: 'flex-end',
    alignSelf: 'flex-end',
  },
  image: {
    height: 304,
    minHeight: 304,
    width: 176,
    minWidth: 176,
    marginBottom: viewOffset,
  },
});
