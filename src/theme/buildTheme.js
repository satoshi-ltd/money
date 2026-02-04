import { theme } from '../config/theme';
import { CommonTheme } from './common.theme';

export const buildTheme = (mode = 'light') => {
  const colors = theme.colors[mode] || theme.colors.light;

  return {
    ...CommonTheme,
    $theme: mode,
    $colorBase: colors.background,
    $colorSurface: colors.surface,
    $colorBorder: colors.border,
    $colorContent: colors.text,
    $colorContentLight: colors.textSecondary,
    $colorAccent: colors.accent,
    $colorError: colors.danger,
    $colorDisabled: colors.textSecondary,
  };
};
