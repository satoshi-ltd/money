import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Button, Icon, Text } from '@satoshi-ltd/nano-design';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import StyleSheet from 'react-native-extended-stylesheet';

import { Logo } from './components';
import { useStore } from './contexts';
import { C, getNavigationTheme, ICON, L10N } from './modules';
import {
  Account,
  Accounts,
  BaseCurrency,
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
import { PurchaseService } from './services';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const commonScreenOptions = (theme = 'light') => ({
  headerBackground: () => <BlurView intensity={60} tint={theme} style={{ flex: 1 }} />,
  headerShown: true,
  // headerStyle: {},
  // headerTintColor: StyleSheet.value('$colorAccent'),
  // headerTitle: ({ ...props }) => <Text bold {...props} />,
  headerTitle: () => <Logo />,
  headerTitleAlign: 'center',
  // headerTitleStyle: {},
  headerTransparent: true,
});

// eslint-disable-next-line react/prop-types
const Tabs = ({ navigation = {} }) => {
  const { settings: { theme } = {}, subscription } = useStore();

  const handleSubscription = () => {
    PurchaseService.getProducts()
      .then((plans) => {
        navigation.navigate('subscription', { plans });
      })
      .catch((error) => alert(error));
  };

  const screenOptions = {
    ...commonScreenOptions(theme),
    headerLeft: () => <></>,
    headerRight: () =>
      !subscription?.productIdentifier ? (
        <Button
          icon={ICON.STAR}
          secondary
          small
          onPress={handleSubscription}
          style={{ marginRight: StyleSheet.value('$viewOffset') }}
        >
          {L10N.PREMIUM}
        </Button>
      ) : (
        <></>
      ),
    tabBarBackground: () => <BlurView intensity={60} tint={theme} style={{ flex: 1 }} />,
    tabBarShowLabel: true,
    tabBarLabelPosition: 'below-icon',
    tabBarStyle: { backgroundColor: 'transparent', borderTopWidth: 0, elevation: 0, position: 'absolute' },
  };

  const tabBarIcon = ({ color, icon }) => <Icon name={icon} subtitle style={{ color }} />;

  const tabBarLabel = ({ color, text }) => (
    <Text tiny style={{ color, marginBottom: 4 }}>
      {text}
    </Text>
  );

  return (
    <Tab.Navigator initialRouteName="dashboard" shifting screenOptions={screenOptions}>
      <Tab.Screen
        name="dashboard"
        component={Dashboard}
        options={{
          tabBarLabel: (props) => tabBarLabel({ ...props, text: L10N.HOME }),
          tabBarIcon: (props) => tabBarIcon({ ...props, icon: ICON.HOME }),
          title: L10N.OVERALL_BALANCE,
        }}
      />
      <Tab.Screen
        name="stats"
        component={Stats}
        options={{
          tabBarLabel: (props) => tabBarLabel({ ...props, text: L10N.ACTIVITY }),
          tabBarIcon: (props) => tabBarIcon({ ...props, icon: ICON.STATS }),
          title: L10N.ACTIVITY,
        }}
      />
      <Tab.Screen
        name="accounts"
        component={Accounts}
        options={{
          tabBarLabel: (props) => tabBarLabel({ ...props, text: L10N.ACCOUNTS }),
          tabBarIcon: (props) => tabBarIcon({ ...props, icon: ICON.ACCOUNTS }),
          title: L10N.ACCOUNTS,
        }}
      />
      <Tab.Screen
        name="settings"
        component={Settings}
        options={{
          tabBarLabel: (props) => tabBarLabel({ ...props, text: L10N.SETTINGS }),
          tabBarIcon: (props) => tabBarIcon({ ...props, icon: ICON.SETTINGS }),
          title: L10N.SETTINGS,
        }}
      />
    </Tab.Navigator>
  );
};

export const Navigator = () => {
  const { settings: { onboarded = true, pin, theme = 'light' } = {} } = useStore();

  const screenOptions = { headerBackTitleVisible: false, headerShadowVisible: false, headerShown: false };
  const screen = { ...commonScreenOptions(theme) };
  const modal = { cardOverlayEnabled: true, gestureEnabled: true, presentation: 'transparentModal' };
  // const modalFullscreen = { ...modal, headerShown: false, presentation: 'modal' };

  return (
    <NavigationContainer theme={getNavigationTheme()}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} translucent />

      <Stack.Navigator
        initialRouteName={onboarded ? (C.IS_DEV && pin ? 'main' : 'session') : 'onboarding'}
        // screenOptions={OPTIONS.SCREEN}
        screenOptions={screenOptions}
      >
        <Stack.Screen name="onboarding" component={Onboarding} />
        <Stack.Screen name="session" component={Session} options={{ ...screen, headerShown: false }} />
        <Stack.Screen name="main" component={Tabs} />
        {/* transactions */}
        <Stack.Screen name="transactions" component={Transactions} options={screen} />
        <Stack.Screen name="transaction" component={Transaction} options={modal} />
        <Stack.Screen name="clone" component={Clone} options={modal} />
        {/* -- settings */}
        <Stack.Screen name="account" component={Account} options={modal} />
        <Stack.Screen name="baseCurrency" component={BaseCurrency} options={modal} />
        {/* -- common */}
        <Stack.Screen name="confirm" component={Confirm} options={modal} />
        <Stack.Screen name="subscription" component={Subscription} options={modal} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
