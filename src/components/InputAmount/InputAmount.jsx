import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

import { View } from '../../primitives';
import { getLastRates } from './helpers/getLastRates';
import { styles } from './InputAmount.style';
import { useStore } from '../../contexts';
import { L10N } from '../../modules';
import { InputField } from '../InputField';
import { PriceFriendly } from '../PriceFriendly';

const isNumber = /^[0-9]+([,.][0-9]+)?$|^[0-9]+([,.][0-9]+)?[.,]$/;
const isSignedNumber = /^-?[0-9]+([,.][0-9]+)?$|^-?[0-9]+([,.][0-9]+)?[.,]$|^-$/;

const InputAmount = ({
  account: { currency } = {},
  disabled = false,
  first,
  label,
  last,
  onChange,
  signed = false,
  value,
  ...others
}) => {
  const { settings: { baseCurrency } = {}, rates } = useStore();

  const [exchange, setExchange] = useState();
  useEffect(() => {
    if (currency && currency !== baseCurrency) {
      const latestRates = getLastRates(rates);
      setExchange(latestRates[currency]);
    } else setExchange(undefined);
  }, [baseCurrency, currency, rates]);

  const handleChange = (value = '') => {
    if (!(signed ? isSignedNumber : isNumber).test(value) || value.length === 0) return onChange(undefined);
    onChange(value.replace(',', '.'));
  };

  const amount = parseFloat(value, 10);
  const suffix = exchange && Number.isFinite(amount) ? (
    <View style={styles.exchange}>
      <PriceFriendly size="s" tone="secondary" currency={baseCurrency} value={amount / exchange} />
    </View>
  ) : null;

  return (
    <InputField
      {...others}
      disabled={disabled}
      first={first}
      label={label !== undefined ? label : L10N.AMOUNT}
      last={last}
      suffix={suffix}
      value={value !== undefined && value !== null ? value.toString() : ''}
      keyboardType={signed && Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric'}
      autoComplete="off"
      onSubmitEditing={Keyboard.dismiss}
      onChange={handleChange}
    />
  );
};

InputAmount.propTypes = {
  account: PropTypes.shape({}),
  disabled: PropTypes.bool,
  first: PropTypes.bool,
  label: PropTypes.string,
  last: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  signed: PropTypes.bool,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export { InputAmount };
