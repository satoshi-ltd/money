import { useFonts } from 'expo-font';
import React from 'react';
import StyleSheet from 'react-native-extended-stylesheet';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Navigator } from './App.Navigator';
import { Notification } from './components';
import { StoreProvider } from './contexts';
import { LightTheme } from './theme';

StyleSheet.build(LightTheme);

export const App = () => {
  const [ready] = useFonts({
    'font-default': require('../assets/fonts/EuclidCircularA-Regular.ttf'),
    'font-bold': require('../assets/fonts/EuclidCircularA-SemiBold.ttf'),
    'font-default-secondary': require('../assets/fonts/CanelaText-Regular.otf'),
    'font-bold-secondary': require('../assets/fonts/CanelaText-Bold.otf'),

    'shield-icons': require('../assets/fonts/Shield-Icons.ttf'),
  });

  return ready ? (
    <SafeAreaProvider>
      <StoreProvider>
        <Navigator />
        <Notification />
      </StoreProvider>
    </SafeAreaProvider>
  ) : null;
};
