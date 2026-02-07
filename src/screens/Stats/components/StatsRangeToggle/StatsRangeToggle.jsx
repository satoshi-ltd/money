import PropTypes from 'prop-types';
import React from 'react';

import { SegmentedToggle } from '../../../../components';

const StatsRangeToggle = ({ onChange, options = [], value }) => {
  return <SegmentedToggle options={options} value={value} onChange={(nextValue) => onChange?.(nextValue)} />;
};

StatsRangeToggle.propTypes = {
  onChange: PropTypes.func,
  options: PropTypes.arrayOf(PropTypes.shape({ label: PropTypes.string, value: PropTypes.number })),
  value: PropTypes.number,
};

export { StatsRangeToggle };
