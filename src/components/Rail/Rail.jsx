import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getStyles } from './Rail.styles';
import { useApp } from '../../contexts';
import { ICON, L10N } from '../../modules';
import { Button, Pressable, View } from '../../primitives';
import { theme } from '../../theme';
import { Logo } from '../Logo';

const TABS = ['dashboard', 'accounts', 'stats', 'settings'];

const Rail = ({ state, descriptors = {}, navigation, onActionPress }) => {
  const insets = useSafeAreaInsets();
  const { colors } = useApp();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const handleTabPress = (route, isFocused) => {
    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
  };

  const renderTab = (route) => {
    const isFocused = state.routes[state.index]?.key === route.key;
    const options = descriptors[route.key]?.options;
    const label = options?.tabBarLabel;

    return (
      <Pressable
        accessibilityLabel={options?.tabBarAccessibilityLabel}
        accessibilityRole="tab"
        accessibilityState={{ selected: isFocused }}
        key={route.key}
        onPress={() => handleTabPress(route, isFocused)}
        style={[styles.tab, isFocused ? styles.tabOn : null]}
      >
        {typeof label === 'function' ? label({ focused: isFocused, size: 's' }) : undefined}
      </Pressable>
    );
  };

  return (
    <View
      style={[
        styles.rail,
        {
          paddingBottom: Math.max(insets.bottom, theme.spacing.sm) + theme.spacing.xs,
          paddingLeft: insets.left + theme.spacing.sm,
          paddingTop: insets.top,
        },
      ]}
    >
      <View style={styles.brand}>
        <Logo />
      </View>
      {state.routes.filter((route) => TABS.includes(route.name)).map(renderTab)}
      <View style={styles.spacer} />
      <Button accessibilityLabel={L10N.EMPTY_TRANSACTIONS_ACTION} icon={ICON.ADD} onPress={onActionPress}>
        {L10N.NEW}
      </Button>
    </View>
  );
};

Rail.propTypes = {
  state: PropTypes.object.isRequired,
  descriptors: PropTypes.object,
  navigation: PropTypes.object.isRequired,
  onActionPress: PropTypes.func,
};

export default Rail;
