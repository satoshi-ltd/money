import { StyleSheet } from 'react-native';

import { theme } from '../../theme';
import { viewOffset } from '../../theme/layout';

export const getStyles = (colors) =>
  StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'flex-end',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.35)',
    },
    backdropPressable: {
      flex: 1,
    },
    keyboardAvoid: {
      justifyContent: 'flex-end',
    },
    sheet: {
      borderTopLeftRadius: theme.borderRadius.md,
      borderTopRightRadius: theme.borderRadius.md,
      overflow: 'hidden',
      backgroundColor: colors.background,
      maxHeight: '90%',
    },
    handle: {
      alignSelf: 'center',
      width: theme.spacing.xl,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    container: {
      paddingHorizontal: viewOffset,
      paddingBottom: viewOffset,
      alignSelf: 'stretch',
    },
    content: {
      gap: theme.spacing.sm,
    },
  });
