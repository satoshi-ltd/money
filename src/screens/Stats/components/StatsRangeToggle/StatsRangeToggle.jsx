import { Pressable, Text, View } from '../../../../design-system';
import PropTypes from 'prop-types';
import React from 'react';

import { style } from './StatsRangeToggle.style';

const StatsRangeToggle = ({ onChange, options = [], value }) => (
  <View row align="center" style={style.container}>
    {options.map((option) => {
      const selected = option.value === value;
      return (
        <Pressable
          key={option.value}
          onPress={() => onChange?.(option.value)}
          style={[style.item, selected && style.itemActive]}
        >
          <Text caption bold color={selected ? 'base' : 'contentLight'}>
            {option.label}
          </Text>
        </Pressable>
      );
    })}
  </View>
);

StatsRangeToggle.propTypes = {
  onChange: PropTypes.func,
  options: PropTypes.arrayOf(PropTypes.shape({ label: PropTypes.string, value: PropTypes.number })),
  value: PropTypes.number,
};

export { StatsRangeToggle };
