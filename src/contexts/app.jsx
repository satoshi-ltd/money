import { useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { detectDeviceLanguage, formatDateTime, translate } from '../i18n';
import { theme } from '../theme';
import { useAppPreferences } from './store';

export const useApp = () => {
  const settings = useAppPreferences();
  const scheme = useColorScheme();
  const preference = settings.theme || 'system';
  const mode = preference === 'system' ? scheme || 'light' : preference;
  const colors = theme.colors[mode] || theme.colors.light;
  const language = settings.language || detectDeviceLanguage();

  const formatDate = useMemo(() => {
    return (date, options = {}) => formatDateTime(date, language, options);
  }, [language]);

  return {
    colors,
    theme: mode,
    themePreference: preference,
    language,
    translate,
    formatDate,
  };
};
