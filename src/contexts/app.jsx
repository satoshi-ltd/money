import { useMemo } from 'react';

import { theme } from '../config/theme';
import { detectDeviceLanguage, formatDateTime, translate } from '../i18n';
import { useStore } from './store';

export const useApp = () => {
  const store = useStore();
  const settings = store?.settings || {};
  const mode = settings.theme || 'light';
  const colors = theme.colors[mode] || theme.colors.light;
  const language = settings.language || detectDeviceLanguage();

  const formatDate = useMemo(() => {
    return (date, options = {}) => formatDateTime(date, language, options);
  }, [language]);

  return {
    colors,
    theme: mode,
    language,
    translate,
    formatDate,
  };
};
