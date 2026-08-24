import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import { getStyles } from './Delta.style';
import { useApp } from '../../contexts';
import { percentText } from '../../modules';
import { Text, View } from '../../primitives';

// The chip belongs to a hero figure; in a list the same two tones apply without it.
// Accent marks the direction the reader wants, which for spending is downward, so callers say which that is.
const Delta = ({ caption, decimals = 1, inverted = false, plain = false, size = 'xs', value }) => {
  const { colors } = useApp();
  const style = useMemo(() => getStyles(colors), [colors]);

  if (!Number.isFinite(value) || value === 0) return null;

  const wanted = inverted ? value < 0 : value > 0;

  return (
    <View row style={style.row}>
      <View style={plain ? null : [style.chip, wanted ? style.chipWanted : style.chipPlain]}>
        <Text figure={size} tone={wanted ? 'positive' : undefined}>
          {percentText(value, { decimals, signed: true })}
        </Text>
      </View>
      {caption ? (
        <Text size="xxs" tone="muted">
          {caption}
        </Text>
      ) : null}
    </View>
  );
};

Delta.displayName = 'Delta';

Delta.propTypes = {
  caption: PropTypes.string,
  decimals: PropTypes.number,
  inverted: PropTypes.bool,
  plain: PropTypes.bool,
  size: PropTypes.string,
  value: PropTypes.number,
};

export { Delta };
