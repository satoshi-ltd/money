import { useEffect } from 'react';
import { Appearance } from 'react-native';

export const useNativeScheme = (preference) => {
  useEffect(() => {
    Appearance.setColorScheme(preference === 'light' || preference === 'dark' ? preference : 'unspecified');
  }, [preference]);
};
