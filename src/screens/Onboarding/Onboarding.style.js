import { StyleSheet } from 'react-native';

import { IMAGE_SIZE } from './Onboarding.constants';
import { theme } from '../../theme';
import { viewOffset } from '../../theme/layout';

export const getStyles = (colors) =>
  StyleSheet.create({
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
      paddingBottom: theme.spacing.xl + theme.spacing.xl,
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
      justifyContent: 'flex-end',
    },

    button: {
      width: '33%',
    },

    // ---- survey / lead
    surveyWrap: {
      width: '100%',
    },

    surveyHeader: {
      width: '100%',
      gap: theme.spacing.xs,
    },

    surveyOptions: {
      gap: theme.spacing.sm,
      width: '100%',
      marginTop: theme.spacing.md,
    },

    optionCard: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      gap: theme.spacing.xxs,
    },

    optionCardSelected: {
      borderColor: colors.accent,
    },

    leadForm: {
      width: '100%',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.md,
    },

    leadHint: {
      marginTop: theme.spacing.xxs,
    },
  });
