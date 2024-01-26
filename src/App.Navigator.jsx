import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React from 'react';

import { Icon, Text } from './__design-system__';
import { useStore } from './contexts';
import { getNavigationTheme, ICON, L10N } from './modules';
import { C } from './modules';
import {
  Account,
  Accounts,
  Clone,
  Confirm,
  Dashboard,
  Onboarding,
  Session,
  Settings,
  Stats,
  Subscription,
  Transaction,
  Transactions,
} from './screens';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const headerTitle = (props) => <Text bold {...props} subtitle />;

const OPTIONS = {
  MODAL: { cardOverlayEnabled: true, gestureEnabled: true, presentation: 'transparentModal' },
  MODAL_FULLSCREEN: { cardOverlayEnabled: true, gestureEnabled: true, headerShown: true, presentation: 'modal' },
  SCREEN: { headerShadowVisible: false, headerShown: false, headerTitle },
  TAB: { headerShown: true, headerTitle, tabBarShowLabel: false },
};

const Tabs = () => (
  <Tab.Navigator initialRouteName="dashboard" shifting screenOptions={{ ...OPTIONS.TAB }}>
    <Tab.Screen
      name="dashboard"
      component={Dashboard}
      options={{
        tabBarIcon: ({ color }) => <Icon name={ICON.HOME} color={color} />,
        title: L10N.OVERALL_BALANCE,
      }}
    />
    <Tab.Screen
      name="stats"
      component={Stats}
      options={{
        tabBarIcon: ({ color }) => <Icon name={ICON.STATS} color={color} />,
        title: L10N.ACTIVITY,
      }}
    />
    <Tab.Screen
      name="accounts"
      component={Accounts}
      options={{
        tabBarIcon: ({ color }) => <Icon name={ICON.ACCOUNTS} color={color} />,
        title: L10N.ACCOUNTS,
      }}
    />
    <Tab.Screen
      name="settings"
      component={Settings}
      options={{
        tabBarIcon: ({ color }) => <Icon name={ICON.SETTINGS} color={color} />,
        title: L10N.SETTINGS,
      }}
    />
  </Tab.Navigator>
);

export const Navigator = () => {
  const { settings: { onboarded = true, pin, theme = 'light' } = {} } = useStore();

  return (
    <NavigationContainer theme={getNavigationTheme()}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} translucent />

      <Stack.Navigator
        initialRouteName={onboarded ? (C.IS_DEV && pin ? 'main' : 'session') : 'onboarding'}
        screenOptions={OPTIONS.SCREEN}
      >
        <Stack.Screen name="onboarding" component={Onboarding} />
        <Stack.Screen name="session" component={Session} />
        <Stack.Screen name="main" component={Tabs} />
        <Stack.Screen name="transactions" component={Transactions} options={{ headerShown: true }} />

        <Stack.Screen name="account" component={Account} options={{ ...OPTIONS.MODAL }} />
        <Stack.Screen name="transaction" component={Transaction} options={{ ...OPTIONS.MODAL }} />
        <Stack.Screen name="clone" component={Clone} options={OPTIONS.MODAL} />
        <Stack.Screen name="confirm" component={Confirm} options={{ ...OPTIONS.MODAL }} />
        <Stack.Screen name="subscription" component={Subscription} options={{ ...OPTIONS.MODAL }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
