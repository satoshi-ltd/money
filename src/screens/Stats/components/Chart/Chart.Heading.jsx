import PropTypes from 'prop-types';
import React from 'react';

import { Heading, PriceFriendly } from '../../../../components';

const ChartHeading = ({ color, currency, max, min, title, ...others }) => (
  <Heading {...others} value={title}>
    {min > 0 && <PriceFriendly bold color={color} currency={currency} fixed={0} label="min " tiny value={min} />}
    {max > 0 && <PriceFriendly bold color={color} currency={currency} fixed={0} label="  max " tiny value={max} />}
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
