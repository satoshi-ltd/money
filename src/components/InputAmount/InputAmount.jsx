import { Input, View } from '../../primitives';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Keyboard } from 'react-native';

import { getLastRates } from './helpers/getLastRates';
import { style } from './InputAmount.style';
import { useStore } from '../../contexts';
import { L10N } from '../../modules';
import { PriceFriendly } from '../PriceFriendly';
import { Field } from '../Field';

const isNumber = /^[0-9]+([,.][0-9]+)?$|^[0-9]+([,.][0-9]+)?[.,]$/;

const InputAmount = ({
  account: { currency } = {},
  disabled = false,
  first,
  label = '',
  last,
  onChange,
  value,
  ...others
}) => {
  const { settings: { baseCurrency } = {}, rates } = useStore();

  const [exchange, setExchange] = useState();
  const [focus, setFocus] = useState(false);

  useEffect(() => {
    if (currency && currency !== baseCurrency) {
      const latestRates = getLastRates(rates);
      setExchange(latestRates[currency]);
    } else setExchange(undefined);
  }, [baseCurrency, currency, rates]);

  const handleChange = (value = '') => {
    if (!isNumber.test(value) || value.length === 0) return onChange(undefined);
    onChange(value.replace(',', '.'));
  };

  return (
    <Field focused={focus} label={label || L10N.AMOUNT} first={first} last={last} style={others.style}>
      <View row style={style.row}>
        <Input
          autoComplete="off"
          editable={!disabled}
          keyboardType="numeric"
          value={value !== undefined && value !== null ? value.toString() : ''}
          onBlur={() => setFocus(false)}
          onChange={handleChange}
          onFocus={() => setFocus(true)}
          onSubmitEditing={Keyboard.dismiss}
          style={style.input}
        />
        {exchange && (
          <View style={style.exchange}>
            <PriceFriendly
              size="s"
              tone="secondary"
              currency={baseCurrency}
              value={parseFloat(value || 0, 10) / exchange}
            />
          </View>
        )}
      </View>
    </Field>
  );
};

InputAmount.propTypes = {
  account: PropTypes.shape({}),
  disabled: PropTypes.bool,
  first: PropTypes.bool,
  label: PropTypes.string,
  last: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export { InputAmount };
