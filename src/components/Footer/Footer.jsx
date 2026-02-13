import { BlurView } from 'expo-blur';
import PropTypes from 'prop-types';
import React from 'react';
import { Platform, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '../../contexts';
import { ICON } from '../../modules';
import { Button, Icon, View } from '../../primitives';
import { theme } from '../../theme';

const TAB_SIZE = theme.spacing.xxl + theme.spacing.md;

const routeIcon = (name) => {
  if (name === 'dashboard') return ICON.HOME;
  if (name === 'stats') return ICON.STATS;
  if (name === 'accounts') return ICON.ACCOUNTS;
  if (name === 'settings') return ICON.SETTINGS;
  return ICON.HOME;
};

const Footer = ({ state, navigation, onActionPress }) => {
  const insets = useSafeAreaInsets();
  const { colors, theme: mode } = useApp();
  const isAndroid = Platform.OS === 'android';
  const bottom = Math.max(insets.bottom, theme.spacing.sm);

  const handleTabPress = (route, isFocused) => {
    // Emit tabPress even when already focused so screens can react (e.g. scroll-to-top).
    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
  };

  const navWidth = (state.routes.length + 1.5) * 56;
  const navStyle = [
    styles.blurView,
    {
      width: navWidth,
      borderColor: colors.border,
      backgroundColor: isAndroid ? colors.surface : 'transparent',
    },
  ];

  return (
    <View pointerEvents="box-none" style={[styles.root, { bottom }]}>
      {isAndroid ? (
        <View style={navStyle}>
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;
            return (
              <TouchableOpacity key={route.key} onPress={() => handleTabPress(route, isFocused)} style={styles.tab}>
                <Icon tone={isFocused ? 'accent' : 'secondary'} name={routeIcon(route.name)} size="l" />
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <BlurView
          experimentalBlurMethod="dimezisBlurView"
          blurReductionFactor={0.6}
          intensity={60}
          tint={mode === 'dark' ? 'dark' : 'light'}
          style={navStyle}
        >
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;
            return (
              <TouchableOpacity key={route.key} onPress={() => handleTabPress(route, isFocused)} style={styles.tab}>
                <Icon tone={isFocused ? 'accent' : 'secondary'} name={routeIcon(route.name)} size="l" />
              </TouchableOpacity>
            );
          })}
        </BlurView>
      )}

      <Button
        icon={ICON.EXPENSE}
        size="l"
        onPress={onActionPress}
        style={[styles.actionButton, { borderColor: colors.border }]}
      />
    </View>
  );
};

const styles = {
  root: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    height: TAB_SIZE,
  },
  blurView: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    paddingHorizontal: theme.spacing.xs,
    flexDirection: 'row',
    justifyContent: 'space-between',
    overflow: 'hidden',
    borderRadius: theme.borderRadius.full,
    height: TAB_SIZE,
  },
  tab: {
    height: TAB_SIZE,
    width: TAB_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
  },
  actionButton: {
    position: 'absolute',
    borderWidth: 1,
    width: TAB_SIZE,
    height: TAB_SIZE,
    borderRadius: TAB_SIZE / 2,
    paddingHorizontal: 0,
    paddingVertical: 0,
    left: '50%',
    marginLeft: -TAB_SIZE / 2,
    top: 0,
  },
};

Footer.propTypes = {
  state: PropTypes.object.isRequired,
  descriptors: PropTypes.object,
  navigation: PropTypes.object.isRequired,
  onActionPress: PropTypes.func,
};

export default Footer;
