import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import { getStyles } from './SegmentedToggle.style';
import { useApp } from '../../contexts';
import { Pressable, ScrollView, Text, View } from '../../primitives';

const SegmentedToggle = ({ compact = false, onChange, options = [], scrollable = false, value, style }) => {
  const { colors } = useApp();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const items = options.map((option, index) => {
    const selected = option.value === value;

    return (
      <Pressable
        key={option.value}
        style={[
          styles.item,
          compact ? styles.itemCompact : scrollable ? styles.itemAuto : styles.itemFlex,
          index > 0 && styles.itemDivider,
          selected && styles.itemActive,
        ]}
        onPress={() => onChange?.(option.value, option)}
      >
        <Text bold={selected} medium={!selected} size="s" tone={selected ? 'onInverse' : 'muted'}>
          {option.label}
        </Text>
      </Pressable>
    );
  });

  if (!scrollable)
    return (
      <View row align="center" style={[styles.container, compact && styles.containerCompact, style]}>
        {items}
      </View>
    );

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.scroll, style]}>
      <View row align="center" style={styles.container}>
        {items}
      </View>
    </ScrollView>
  );
};

SegmentedToggle.displayName = 'SegmentedToggle';

SegmentedToggle.propTypes = {
  compact: PropTypes.bool,
  onChange: PropTypes.func,
  options: PropTypes.arrayOf(PropTypes.shape({ label: PropTypes.string, value: PropTypes.any })),
  scrollable: PropTypes.bool,
  value: PropTypes.any,
  style: PropTypes.any,
};

export { SegmentedToggle };
