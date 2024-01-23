import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import { style } from './FormTransfer.style';
import { Icon, Pressable, ScrollView, Text } from '../../../__design-system__';
import { InputCurrency, Option, OPTION_SIZE } from '../../../components';
import { useStore } from '../../../contexts';
import { currencyDecimals, ICON } from '../../../modules';
import { getVault, queryAvailableVaults } from '../helpers';

const FormTransaction = ({ form = {}, onChange, vault = {} }) => {
  const {
    settings: { baseCurrency },
    vaults,
    rates,
  } = useStore();

  const [selectVault, setSelectVault] = useState(false);

  const availableVaults = queryAvailableVaults(vaults, vault);

  useEffect(() => {
    if (form.to === undefined) {
      const [firstVault = {}] = availableVaults;
      onChange({ form: { destination: firstVault.hash, to: firstVault } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  const handleField = (field, fieldValue) => {
    const next = { ...form, [field]: fieldValue };
    const from = getVault(vault.hash, vaults);
    const to = getVault(next.destination, vaults);
    let { exchange = 0, value = 0 } = next;

    if (next.destination && exchange === form.exchange) {
      const keys = Object.keys(rates);
      const lastRates = rates[keys[keys.length - 1]];

      if (from.currency === to.currency) exchange = value;
      else if (from.currency === baseCurrency) exchange = value * lastRates[to.currency];
      else if (to.currency === baseCurrency) exchange = value / lastRates[from.currency];
      else exchange = (value / lastRates[from.currency]) * lastRates[to.currency];

      exchange = parseFloat(exchange, 10).toFixed(currencyDecimals(exchange, to.currency));
    }

    onChange({
      form: { ...next, from, to, exchange },
      valid: next.value > 0 && next.destination !== undefined && next.exchange > 0,
    });
  };

  return (
    <>
      <InputCurrency
        value={form.value}
        vault={vault}
        onChange={(value) => handleField('value', value)}
        style={[!selectVault && style.inputCurrency]}
      />

      {!selectVault && (
        <Pressable style={style.inputVault} onPress={() => setSelectVault(true)}>
          <Icon color="contentLight" name={ICON.OTHERS} />
          <Text color="contentLight" detail>
            $Change destination
          </Text>
        </Pressable>
      )}
      {selectVault ? (
        <ScrollView horizontal snap={OPTION_SIZE} style={style.slider}>
          {availableVaults.map(({ currency, hash, title }, index) => (
            <Option
              currency={currency}
              highlight={hash === form.destination}
              key={hash}
              legend={title}
              onPress={() => {
                handleField('destination', hash);
                setSelectVault(false);
              }}
              style={[
                style.card,
                index === 0 && style.firstCard,
                index === availableVaults.length - 1 && style.lastCard,
              ]}
            />
          ))}
        </ScrollView>
      ) : (
        <InputCurrency
          currency={form.to ? form.to.currency : baseCurrency}
          value={form.to ? form.exchange : undefined}
          vault={getVault(form.destination, vaults)}
          onChange={(value) => handleField('exchange', value)}
          style={style.inputTitle}
        />
      )}
    </>
  );
};

FormTransaction.propTypes = {
  form: PropTypes.shape({}).isRequired,
  vault: PropTypes.shape({}).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default FormTransaction;
