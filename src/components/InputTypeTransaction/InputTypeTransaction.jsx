import PropTypes from 'prop-types';
import React from 'react';

import { InputGroupOption } from '../InputGroupOption';
import { C, L10N } from '../../modules';

const {
  TX: {
    TYPE: { EXPENSE, INCOME },
  },
} = C;

const InputTypeTransaction = ({ first, last, onChange, value }) => {
  const options = [
    { label: L10N.EXPENSE, value: EXPENSE },
    { label: L10N.INCOME, value: INCOME },
  ];

  return <InputGroupOption first={first} label={L10N.TYPE} last={last} options={options} value={value} onChange={onChange} />;
};

InputTypeTransaction.displayName = 'InputTypeTransaction';

InputTypeTransaction.propTypes = {
  first: PropTypes.bool,
  last: PropTypes.bool,
  onChange: PropTypes.func,
  value: PropTypes.number,
};

export { InputTypeTransaction };
