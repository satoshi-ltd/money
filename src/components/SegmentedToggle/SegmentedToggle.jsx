import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import { getStyles } from './SegmentedToggle.style';
import { useApp } from '../../contexts';
import { Pressable, Text, View } from '../../primitives';

const SegmentedToggle = ({ onChange, options = [], value, style }) => {
  const { colors } = useApp();
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <View row align="center" style={[styles.container, style]}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange?.(option.value, option)}
            style={[styles.item, selected && styles.itemActive]}
          >
            <Text bold tone={selected ? 'onAccent' : 'secondary'} size="s">
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

SegmentedToggle.displayName = 'SegmentedToggle';

SegmentedToggle.propTypes = {
  onChange: PropTypes.func,
  options: PropTypes.arrayOf(PropTypes.shape({ label: PropTypes.string, value: PropTypes.any })),
  value: PropTypes.any,
  style: PropTypes.any,
};

export { SegmentedToggle };

