import { useFonts } from 'expo-font';
import React from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Navigator } from './App.Navigator';
import { Confirm, ErrorBoundary, Notification } from './components';
import { StoreProvider } from './contexts';

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export const App = () => {
  const [ready] = useFonts({
    'font-default': require('../assets/fonts/EuclidCircularA-Regular.ttf'),
    'font-medium': require('../assets/fonts/EuclidCircularA-Medium.ttf'),
    'font-bold': require('../assets/fonts/EuclidCircularA-SemiBold.ttf'),
    'font-mono': require('../assets/fonts/GeistMono-Regular.ttf'),
    'font-mono-medium': require('../assets/fonts/GeistMono-Medium.ttf'),
  });

  return ready ? (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <StoreProvider>
            <Navigator />
          </StoreProvider>
        </ErrorBoundary>
        <Notification />
        <Confirm />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  ) : null;
};
