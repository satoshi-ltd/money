import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet } from 'react-native';

import { Button, Footer, Icon, Text } from './components';
import { Logo } from './components';
import { useApp, useStore } from './contexts';
import { C, eventEmitter, getNavigationTheme, ICON, L10N } from './modules';
import {
  Account,
  Accounts,
  BaseCurrency,
  Clone,
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
import { theme } from './theme';
import { viewOffset } from './theme/layout';

const { EVENT, TX: { TYPE: { EXPENSE } } = {} } = C;

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const styles = StyleSheet.create({
  tabLabel: {
    marginBottom: theme.spacing.xxs,
  },
  premiumButton: {
    marginRight: viewOffset,
  },
  actionButton: {
    marginHorizontal: theme.spacing.md,
    top: -theme.spacing.sm,
  },
});

const commonScreenOptions = (colors) => ({
  headerBackVisible: false,
  headerShown: true,
  headerTitle: () => <Logo />,
  headerTitleAlign: 'center',
  headerTransparent: false,
  headerStyle: { backgroundColor: colors.background },
  headerTintColor: colors.text,
});

// eslint-disable-next-line react/prop-types
const Tabs = ({ navigation = {} }) => {
  const { colors } = useApp();
  const { subscription } = useStore();

  // ! TODO: Somehow we should use new accent

  const handleSubscription = () => {
    PurchaseService.getProducts()
      .then((plans) => {
        navigation.navigate('subscription', { plans });
      })
      .catch((error) => eventEmitter.emit(EVENT.NOTIFICATION, { error: true, text: JSON.stringify(error) }));
  };

  const screenOptions = {
    ...commonScreenOptions(colors),
    headerLeft: () => <></>,
    headerRight: () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return !subscription?.productIdentifier ? (
        <Button icon={ICON.STAR} size="s" onPress={handleSubscription} style={styles.premiumButton}>
          {L10N.PREMIUM}
        </Button>
      ) : (
        <></>
      );
    },
  };

  const tabBarIcon = ({ focused, icon }) => <Icon name={icon} size="l" tone={focused ? 'accent' : 'secondary'} />;

  const tabBarLabel = ({ focused, text }) => (
    <Text style={styles.tabLabel} size="xs" tone={focused ? 'accent' : 'secondary'}>
      {text}
    </Text>
  );

  return (
    <Tab.Navigator
      initialRouteName="dashboard"
      shifting
      screenOptions={screenOptions}
      tabBar={(props) => (
        <Footer {...props} onActionPress={() => navigation.navigate('transaction', { type: EXPENSE })} />
      )}
    >
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
        name="transaction"
        component={Transaction}
        options={{
          tabBarButton: () => (
            <Button
              icon={ICON.EXPENSE}
              size="l"
              onPress={() => navigation.navigate('transaction', { type: EXPENSE })}
              style={styles.actionButton}
            />
          ),
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
  const { colors, theme: themeMode } = useApp();
  const { settings: { onboarded = true, pin } = {} } = useStore();

  const screenOptions = { headerBackTitleVisible: false, headerShadowVisible: false, headerShown: false };
  const screen = { ...commonScreenOptions(colors) };
  const panel = { headerShown: false, presentation: 'card' };

  return (
    <NavigationContainer theme={getNavigationTheme(colors)}>
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} translucent />

      <Stack.Navigator
        initialRouteName={onboarded ? (C.IS_DEV && pin ? 'main' : 'session') : 'onboarding'}
        screenOptions={screenOptions}
      >
        <Stack.Screen name="onboarding" component={Onboarding} />
        <Stack.Screen name="session" component={Session} options={{ ...screen, headerShown: false }} />
        <Stack.Screen name="main" component={Tabs} />
        {/* transactions */}
        <Stack.Screen name="transactions" component={Transactions} options={panel} />
        <Stack.Screen name="transaction" component={Transaction} options={panel} />
        <Stack.Screen name="clone" component={Clone} options={panel} />
        {/* -- settings */}
        <Stack.Screen name="account" component={Account} options={panel} />
        <Stack.Screen name="baseCurrency" component={BaseCurrency} options={panel} />
        {/* -- common */}
        <Stack.Screen name="subscription" component={Subscription} options={panel} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
