import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import { getStyles } from './Logo.style';
import { useApp } from '../../contexts';
import { Text } from '../../primitives';
import { theme } from '../../theme';

const Logo = ({ size = theme.typography.sizes.tiny }) => {
  const { colors } = useApp();
  const style = useMemo(() => getStyles(colors, size), [colors, size]);

  return (
    <Text bold style={style.text}>
      MÔNEY
    </Text>
  );
};

Logo.propTypes = {
  size: PropTypes.number,
};

export { Logo };
