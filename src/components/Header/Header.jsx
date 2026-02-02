import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet } from 'react-native';

import { useApp } from '../../contexts';
import { Icon, Pressable, Text, View } from '../../design-system';
import { ICON } from '../../modules';
import { theme } from '../../config/theme';

const Header = ({ title, onBack, leftElement, rightElement, showBorder = false, transparent = false, style }) => {
  const { colors } = useApp();

  return (
    <View
      style={[
        styles.container,
        !transparent && { backgroundColor: colors.background },
        showBorder ? { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth } : null,
        style,
      ]}
    >
      {leftElement ? (
        <View style={styles.side}>{leftElement}</View>
      ) : onBack ? (
        <Pressable onPress={onBack} style={styles.side}>
          <Icon name={ICON.BACK} />
        </Pressable>
      ) : (
        <View style={styles.side} />
      )}

      <Text bold subtitle>
        {title}
      </Text>

      {rightElement ? <View style={styles.sideRight}>{rightElement}</View> : <View style={styles.sideRight} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  side: {
    width: 44,
    alignItems: 'flex-start',
  },
  sideRight: {
    width: 44,
    alignItems: 'flex-end',
  },
});

Header.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  onBack: PropTypes.func,
  leftElement: PropTypes.node,
  rightElement: PropTypes.node,
  showBorder: PropTypes.bool,
  transparent: PropTypes.bool,
  style: PropTypes.any,
};

export default Header;
