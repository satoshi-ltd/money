import { BlurView } from 'expo-blur';
import PropTypes from 'prop-types';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '../../config/theme';
import { useApp } from '../../contexts';
import { ICON } from '../../modules';
import { Button, Icon, View } from '../../primitives';

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

  const handleTabPress = (route, isFocused) => {
    if (isFocused) return;
    navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    navigation.navigate(route.name);
  };

  return (
    <View pointerEvents="box-none" style={[styles.root, { bottom: insets.bottom }]}>
      <BlurView
        experimentalBlurMethod="dimezisBlurView"
        blurReductionFactor={0.6}
        intensity={60}
        tint={mode === 'dark' ? 'dark' : 'light'}
        style={[styles.blurView, { width: (state.routes.length + 1.5) * 56, borderColor: colors.border }]}
      >
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => handleTabPress(route, isFocused)}
              style={styles.tab}
            >
              <Icon color={isFocused ? 'accent' : 'contentLight'} name={routeIcon(route.name)} size="l" />
            </TouchableOpacity>
          );
        })}
      </BlurView>

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
