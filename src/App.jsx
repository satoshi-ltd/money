import { useFonts } from 'expo-font';
import React from 'react';
import StyleSheet from 'react-native-extended-stylesheet';

import { Navigator } from './App.Navigator';
import { StoreProvider } from './contexts';
import { LightTheme } from './theme';

StyleSheet.build(LightTheme);

export const App = () => {
  const [ready] = useFonts({
    'font-default': require('../assets/fonts/Roobert-400.ttf'),
    // 'font-default': require('../assets/fonts/Rebond-Grotesque-600.ttf'),
    'font-bold': require('../assets/fonts/Rebond-Grotesque-700.ttf'),
    'shield-icons': require('../assets/fonts/Shield-Icons.ttf'),
  });

  return ready ? (
    <StoreProvider>
      <Navigator />
    </StoreProvider>
  ) : null;
};
