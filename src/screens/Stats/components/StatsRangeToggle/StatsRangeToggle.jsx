import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import { getStyles } from './StatsRangeToggle.style';
import { useApp } from '../../../../contexts';
import { Pressable, Text, View } from '../../../../primitives';

const StatsRangeToggle = ({ onChange, options = [], value }) => {
  const { colors } = useApp();
  const style = useMemo(() => getStyles(colors), [colors]);

  return (
    <View row align="center" style={style.container}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange?.(option.value)}
            style={[style.item, selected && style.itemActive]}
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

StatsRangeToggle.propTypes = {
  onChange: PropTypes.func,
  options: PropTypes.arrayOf(PropTypes.shape({ label: PropTypes.string, value: PropTypes.number })),
  value: PropTypes.number,
};

export { StatsRangeToggle };
