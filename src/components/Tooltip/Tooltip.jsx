import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';

import { theme } from '../../config/theme';
import { useApp } from '../../contexts';
import { Text, View } from '../../primitives';

const getStyles = (colors, position = 'top', align = 'center', offset) => {
  const alignStyles =
    align === 'left'
      ? { alignItems: 'flex-start' }
      : align === 'right'
      ? { alignItems: 'flex-end' }
      : { alignItems: 'center' };
  const triangle = theme.spacing.xs;

  return StyleSheet.create({
    wrap: {
      position: 'absolute',
      left: 0,
      right: 0,
      ...(position === 'top' ? { bottom: offset ?? theme.spacing.xl } : { top: offset ?? theme.spacing.xl }),
      ...alignStyles,
    },
    bubble: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      backgroundColor: colors.text,
      ...theme.shadows.md,
    },
    arrow: {
      width: 0,
      height: 0,
      borderLeftWidth: triangle,
      borderRightWidth: triangle,
      ...(position === 'top' ? { borderTopWidth: triangle } : { borderBottomWidth: triangle }),
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      ...(position === 'top' ? { borderTopColor: colors.text } : { borderBottomColor: colors.text }),
      ...(position === 'top' ? { marginTop: -StyleSheet.hairlineWidth } : { marginBottom: -StyleSheet.hairlineWidth }),
    },
  });
};

const Tooltip = ({ visible, text, position = 'top', align = 'center', offset, children }) => {
  const { colors } = useApp();
  const styles = getStyles(colors, position, align, offset);
  const { width: windowWidth } = useWindowDimensions();

  if (!visible) return null;

  return (
    <View pointerEvents="box-none" style={styles.wrap}>
      <View style={[styles.bubble, { width: windowWidth * 0.6 }]}>
        {text ? (
          <Text tone="inverse" size="s">
            {text}
          </Text>
        ) : (
          children
        )}
      </View>
      <View style={styles.arrow} />
    </View>
  );
};

Tooltip.propTypes = {
  visible: PropTypes.bool,
  text: PropTypes.string,
  position: PropTypes.oneOf(['top', 'bottom']),
  align: PropTypes.oneOf(['left', 'center', 'right']),
  offset: PropTypes.number,
  children: PropTypes.node,
};

export default Tooltip;
