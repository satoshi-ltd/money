import PropTypes from 'prop-types';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '../../contexts';
import { ICON } from '../../modules';
import { Icon, Pressable, View } from '../../primitives';
import { theme } from '../../theme';
import { sealSize } from '../../theme/layout';

const TABS = ['dashboard', 'accounts', 'stats', 'settings'];

const Footer = ({ state, descriptors = {}, navigation, onActionPress }) => {
  const insets = useSafeAreaInsets();
  const { colors } = useApp();
  const bottom = Math.max(insets.bottom, theme.spacing.sm);

  const handleTabPress = (route, isFocused) => {
    // Emit tabPress even when already focused so screens can react (e.g. scroll-to-top).
    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
  };

  const renderTab = (route, index) => {
    const isFocused = state.index === index;
    const label = descriptors[route.key]?.options?.tabBarLabel;

    return (
      <TouchableOpacity
        key={route.key}
        style={[styles.tab, isFocused ? { backgroundColor: colors.surfaceSoft } : null]}
        onPress={() => handleTabPress(route, isFocused)}
      >
        {typeof label === 'function' ? label({ focused: isFocused }) : undefined}
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[
        styles.bar,
        { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: bottom },
      ]}
    >
      {state.routes.map((route, index) =>
        TABS.includes(route.name) ? (
          renderTab(route, index)
        ) : (
          <Pressable key={route.key} onPress={onActionPress} style={[styles.seal, { backgroundColor: colors.inverse }]}>
            <Icon name={ICON.ADD} size="l" tone="onInverse" />
          </Pressable>
        ),
      )}
    </View>
  );
};

const styles = {
  bar: {
    alignItems: 'center',
    borderTopWidth: theme.hairline,
    flexDirection: 'row',
    gap: theme.spacing.xxs,
    paddingHorizontal: theme.spacing.xs,
    paddingTop: theme.spacing.xs + 2,
  },
  tab: {
    alignItems: 'center',
    borderRadius: theme.borderRadius.sm,
    flex: 1,
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
  },
  seal: {
    alignItems: 'center',
    borderRadius: theme.borderRadius.sm,
    height: sealSize,
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
    marginHorizontal: theme.spacing.xs,
    width: sealSize,
  },
};

Footer.propTypes = {
  state: PropTypes.object.isRequired,
  descriptors: PropTypes.object,
  navigation: PropTypes.object.isRequired,
  onActionPress: PropTypes.func,
};

export default Footer;
