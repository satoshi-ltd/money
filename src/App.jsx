import { useFonts } from 'expo-font';
import React from 'react';
import StyleSheet from 'react-native-extended-stylesheet';

import { Navigator } from './App.Navigator';
import { StoreProvider } from './contexts';
import { LightTheme } from './theme';

StyleSheet.build(LightTheme);

export const App = () => {
  const [ready] = useFonts({
    'font-default': require('../assets/fonts/VisbyCF-Medium.otf'),
    'font-bold': require('../assets/fonts/VisbyCF-Bold.otf'),

    'shield-icons': require('../assets/fonts/Shield-Icons.ttf'),
  });

  return ready ? (
    <StoreProvider>
      <Navigator />
    </StoreProvider>
  ) : null;
};
