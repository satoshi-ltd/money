import PropTypes from 'prop-types';
import React from 'react';

import { Heading, PriceFriendly } from '../../../../components';
import { L10N } from '../../../../modules';

const ChartHeading = ({ color, currency, max, min, title, ...others }) => (
  <Heading {...others} value={title}>
    {min > 0 && (
      <PriceFriendly bold color={color} currency={currency} fixed={0} label={`${L10N.MIN} `} size="xs" value={min} />
    )}
    {max > 0 && (
      <PriceFriendly bold color={color} currency={currency} fixed={0} label={`  ${L10N.MAX} `} size="xs" value={max} />
    )}
  </Heading>
);

ChartHeading.propTypes = {
  color: PropTypes.string,
  currency: PropTypes.string,
  max: PropTypes.number,
  min: PropTypes.number,
  title: PropTypes.string,
};

export { ChartHeading };
