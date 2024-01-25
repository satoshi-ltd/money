import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Keyboard, TextInput } from 'react-native';

import { getLastRates } from './helpers';
import { style } from './InputCurrency.style';
import { Text, View } from '../../__design-system__';
import { useStore } from '../../contexts';
import { L10N } from '../../modules';
import { CurrencyLogo } from '../CurrencyLogo';
import { PriceFriendly } from '../PriceFriendly';

const InputCurrency = ({
  label = '',
  showCurrency = false,
  onChange,
  vault: { currency, currentBalance, hash: vaultHash, title } = {},
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
    if (isNaN(value) || value.length === 0) return onChange(undefined);
    onChange(value);
  };

  return (
    <View gap row style={[style.container, focus && style.focus, others.style]}>
      {showCurrency && <CurrencyLogo color="border" currency={currency} />}
      <View>
        <Text bold={!!vaultHash} caption={!vaultHash}>
          {title || label}
        </Text>
        {vaultHash && (
          <View row style={style.currentBalance}>
            <Text color="contentLight" caption>
              {L10N.BALANCE}
            </Text>
            <PriceFriendly caption color="contentLight" currency={currency} value={currentBalance} />
          </View>
        )}
      </View>

      <View style={style.amounts}>
        <PriceFriendly
          bold
          currency={currency}
          maskAmount={false}
          subtitle
          value={others.value ? parseFloat(others.value, 10) : undefined}
          style={style.value}
        />
        {exchange && (
          <PriceFriendly
            caption
            color="contentLight"
            currency={baseCurrency}
            value={parseFloat(others.value || 0, 10) / exchange}
          />
        )}
      </View>

      <TextInput
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect={false}
        blurOnSubmit
        editable
        keyboardType="numeric"
        onBlur={() => setFocus(false)}
        onChangeText={handleChange}
        onFocus={() => setFocus(true)}
        onSubmitEditing={Keyboard.dismiss}
        style={style.input}
        value={others.value ? others.value.toString() : ''}
      />
    </View>
  );
};

InputCurrency.propTypes = {
  label: PropTypes.string,
  showCurrency: PropTypes.bool,
  vault: PropTypes.shape({}),
  onChange: PropTypes.func.isRequired,
};

export { InputCurrency };
