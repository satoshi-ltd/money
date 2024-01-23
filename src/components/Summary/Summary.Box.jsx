import PropTypes from 'prop-types';
import React from 'react';

import { style } from './Summary.style';
import { Text, View } from '../../__design-system__';
import { PriceFriendly } from '../PriceFriendly';

const SummaryBox = ({ caption = '', value, ...inherit }) => (
  <View style={style.summaryBox}>
    <Text bold color="contentLight" caption numberOfLines={1}>
      {caption}
    </Text>
    <PriceFriendly {...inherit} bold fixed={value >= 100 ? 0 : undefined} value={value} />
  </View>
);

SummaryBox.propTypes = {
  caption: PropTypes.string.isRequired,
  value: PropTypes.number,
};

export { SummaryBox };
