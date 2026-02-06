import { DefaultTheme } from '@react-navigation/native';
export const getNavigationTheme = (colors) => ({
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors?.text ?? DefaultTheme.colors.primary,
    background: colors?.background ?? DefaultTheme.colors.background,
    card: colors?.background ?? DefaultTheme.colors.card,
    text: colors?.textSecondary ?? DefaultTheme.colors.text,
    border: colors?.background ?? DefaultTheme.colors.border,
  },
});
