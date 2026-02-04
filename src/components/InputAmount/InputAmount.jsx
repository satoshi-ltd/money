import { View } from '../../primitives';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Keyboard, TextInput } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

import { getLastRates } from './helpers/getLastRates';
import { style } from './InputAmount.style';
import { useStore } from '../../contexts';
import { L10N } from '../../modules';
import { PriceFriendly } from '../PriceFriendly';
import { Field } from '../Field';

const isNumber = /^[0-9]+([,.][0-9]+)?$|^[0-9]+([,.][0-9]+)?[.,]$/;

const InputAmount = ({
  account: { currency } = {},
  editable = true,
  first,
  label = '',
  last,
  onChange,
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
        <TextInput
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect={false}
          blurOnSubmit
          editable={editable}
          keyboardType="numeric"
          placeholder={!focus ? '...' : undefined}
          placeholderTextColor={StyleSheet.value('$inputPlaceholderColor')}
          value={others.value ? others.value.toString() : ''}
          onBlur={() => setFocus(false)}
          onChangeText={handleChange}
          onFocus={() => setFocus(true)}
          onSubmitEditing={Keyboard.dismiss}
          style={style.input}
        />
        {exchange && (
          <View style={style.exchange}>
            <PriceFriendly
              size="s"
              color="contentLight"
              currency={baseCurrency}
              value={parseFloat(others.value || 0, 10) / exchange}
            />
          </View>
        )}
      </View>
    </Field>
  );
};

InputAmount.propTypes = {
  account: PropTypes.shape({}),
  editable: PropTypes.bool,
  first: PropTypes.bool,
  label: PropTypes.string,
  last: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
};

export { InputAmount };
