import PropTypes from 'prop-types';
import React from 'react';

import { styles } from './InputGroupOption.style';
import { Field } from '../Field';
import { SegmentedToggle } from '../SegmentedToggle';
import { Text, View } from '../../primitives';

const InputGroupOption = ({ first, label, last, onChange, options, value }) => (
  <Field first={first} last={last}>
    <View style={styles.row}>
      <Text bold>
        {label}
      </Text>
      <SegmentedToggle options={options} value={value} onChange={onChange} style={styles.group} />
    </View>
  </Field>
);

InputGroupOption.displayName = 'InputGroupOption';

InputGroupOption.propTypes = {
  first: PropTypes.bool,
  label: PropTypes.string,
  last: PropTypes.bool,
  onChange: PropTypes.func,
  options: PropTypes.arrayOf(PropTypes.shape({ label: PropTypes.string, value: PropTypes.any })),
  value: PropTypes.any,
};

export { InputGroupOption };
