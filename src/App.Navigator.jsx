import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Footer, Logo, Text } from './components';
import { useApp, useStore } from './contexts';
import { C, L10N, getNavigationTheme, sheetContentHeight, sheetDetents } from './modules';
import {
  Account,
  Accounts,
  Category,
  Clone,
  Dashboard,
  Onboarding,
  Scheduled,
  ScheduledForm,
  Session,
  Settings,
  Stats,
  Transaction,
  Transactions,
} from './screens';
import { theme } from './theme';
import { rowHeight } from './theme/layout';

const { TX: { TYPE: { EXPENSE } } = {} } = C;

const LATEST_ROWS = 3;

// The weekday chips or the date row that replaces them, whichever is taller, plus the sentence reading the rule back.
const SCHEDULED_REPEAT =
  rowHeight + theme.spacing.md + theme.typography.lineHeights.body + theme.spacing.sm;

// What each form is made of, so its height comes from the same tokens the form is built from.
const FORM = {
  account: { keyboard: true, rows: 3 },
  category: { actions: 0, headings: 2, hero: true, rows: 6 },
  clone: { keyboard: true, rows: 5 },
  scheduled: { extra: SCHEDULED_REPEAT, headings: 1, keyboard: true, rows: 4, toggles: 2 },
  transaction: { keyboard: true, rows: 5, toggles: 1 },
};

// The sheet is as tall as the category has to say, and no taller.
const categoryRows = (merchants) => (merchants > 0 ? merchants : 0) + LATEST_ROWS;

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

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
  const insets = useSafeAreaInsets();
  const { colors } = useApp();

  // ! TODO: Somehow we should use new accent

  const screenOptions = {
    ...commonScreenOptions(colors),
    freezeOnBlur: true,
    headerShown: false,
    sceneStyle: { backgroundColor: colors.background, paddingTop: insets.top },
    headerLeft: () => <></>,
    headerRight: () => <></>,
  };


  const tabBarLabel = ({ focused, text }) => (
    <Text medium={focused} numberOfLines={1} size="xs" tone={focused ? undefined : 'muted'}>
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
          tabBarLabel: (props) => tabBarLabel({ ...props, text: L10N.OVERVIEW }),
          title: L10N.NET_WORTH,
        }}
      />
      <Tab.Screen
        name="accounts"
        component={Accounts}
        options={{
          tabBarLabel: (props) => tabBarLabel({ ...props, text: L10N.ACCOUNTS }),
          title: L10N.ACCOUNTS,
        }}
      />
      <Tab.Screen name="transaction" component={Transaction} />
      <Tab.Screen
        name="stats"
        component={Stats}
        options={{
          tabBarLabel: (props) => tabBarLabel({ ...props, text: L10N.ACTIVITY }),
          title: L10N.ACTIVITY,
        }}
      />
      <Tab.Screen
        name="settings"
        component={Settings}
        options={{
          tabBarLabel: (props) => tabBarLabel({ ...props, text: L10N.SETTINGS }),
          title: L10N.SETTINGS,
        }}
      />
    </Tab.Navigator>
  );
};

export const Navigator = () => {
  const { colors, theme: themeMode } = useApp();
  const { bottom, top } = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { settings: { onboarded = true, pin } = {} } = useStore();

  const screenOptions = {
    headerShadowVisible: false,
    headerShown: false,
    contentStyle: { backgroundColor: colors.background },
  };
  const screen = { ...commonScreenOptions(colors) };
  const panel = { headerShown: false, presentation: 'card' };
  // Android reads the detents once, at mount, so the height comes from tokens and is never measured.
  const sheet = ({ keyboard, ...form }) => ({
    contentStyle: { backgroundColor: colors.surface },
    headerShown: false,
    presentation: 'formSheet',
    sheetAllowedDetents: sheetDetents(sheetContentHeight({ ...form, bottom }), windowHeight, { keyboard, topInset: top }),
    sheetCornerRadius: theme.borderRadius.xl,
    sheetGrabberVisible: false,
  });

  return (
    <NavigationContainer theme={getNavigationTheme(colors)}>
      <StatusBar
        style={themeMode === 'dark' ? 'light' : 'dark'}
        translucent={true}
        backgroundColor={Platform.OS === 'android' ? 'transparent' : undefined}
      />

      <Stack.Navigator
        initialRouteName={!onboarded ? 'onboarding' : pin && !C.IS_DEV ? 'session' : 'main'}
        screenOptions={screenOptions}
      >
        <Stack.Screen name="onboarding" component={Onboarding} />
        <Stack.Screen name="session" component={Session} options={{ ...screen, headerShown: false }} />
        <Stack.Screen name="main" component={Tabs} />
        {/* transactions */}
        <Stack.Screen name="transactions" component={Transactions} options={panel} />
        <Stack.Screen name="transaction" component={Transaction} options={sheet(FORM.transaction)} />
        <Stack.Screen name="clone" component={Clone} options={sheet(FORM.clone)} />
        <Stack.Screen name="scheduled" component={Scheduled} options={panel} />
        <Stack.Screen name="scheduledForm" component={ScheduledForm} options={sheet(FORM.scheduled)} />
        {/* -- settings */}
        <Stack.Screen name="account" component={Account} options={sheet(FORM.account)} />
        <Stack.Screen
          name="category"
          component={Category}
          options={({ route }) => sheet({ ...FORM.category, rows: categoryRows(route.params?.merchants) })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
