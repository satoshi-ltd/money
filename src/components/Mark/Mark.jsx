import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import { getStyles } from './Mark.style';
import { Text, View } from '../../primitives';

const Mark = ({ size = 44 }) => {
  const style = useMemo(() => getStyles(size), [size]);

  return (
    <View style={style.plate}>
      <Text style={style.letters}>MÔ</Text>
    </View>
  );
};

Mark.displayName = 'Mark';

Mark.propTypes = {
  size: PropTypes.number,
};

export { Mark };
