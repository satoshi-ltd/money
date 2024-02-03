import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import StyleSheet from 'react-native-extended-stylesheet';

import { style } from './FormTransfer.style';
import { Icon, Pressable, ScrollView, Text } from '../../../__design-system__';
import { CardOption, InputCurrency } from '../../../components';
import { useStore } from '../../../contexts';
import { currencyDecimals, ICON, L10N } from '../../../modules';
import { getAccount, queryAvailableAccounts } from '../helpers';

const FormTransaction = ({ account = {}, form = {}, onChange }) => {
  const {
    accounts = [],
    settings: { baseCurrency },
    rates,
  } = useStore();

  const [selectedAccount, setSelectAccount] = useState(false);

  const availableAccounts = queryAvailableAccounts(accounts, account);

  useEffect(() => {
    if (form.to === undefined) {
      const [firstAccount = {}] = availableAccounts;
      onChange({ form: { destination: firstAccount.hash, to: firstAccount } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  const handleField = (field, fieldValue) => {
    const next = { ...form, [field]: fieldValue };
    const from = getAccount(account.hash, accounts);
    const to = getAccount(next.destination, accounts);
    let { exchange = 0, value = 0 } = next;

    if (next.destination && (exchange === form.exchange || !exchange)) {
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
      valid: next.value > 0 && next.destination !== undefined && exchange > 0,
    });
  };

  const optionSnap = StyleSheet.value('$optionSnap');

  return (
    <>
      <InputCurrency
        account={account}
        showCurrency
        value={form.value}
        onChange={(value) => handleField('value', value)}
        style={[!selectedAccount && style.inputCurrency]}
      />

      {!selectedAccount && (
        <Pressable onPress={() => setSelectAccount(true)} style={style.inputAccount}>
          <Icon body color="contentLight" name={ICON.OTHERS} />
          <Text caption color="contentLight">
            {L10N.CHANGE_DESTINATION}
          </Text>
        </Pressable>
      )}
      {selectedAccount ? (
        <ScrollView horizontal snap={optionSnap} style={style.scrollView}>
          {availableAccounts.map(({ currency, hash, title }, index) => (
            <CardOption
              currency={currency}
              highlight={hash === form.destination}
              key={hash}
              legend={title}
              onPress={() => {
                handleField('destination', hash);
                setSelectAccount(false);
              }}
              style={[
                style.option,
                index === 0 && style.firstOption,
                index === availableAccounts.length - 1 && style.lastOption,
              ]}
            />
          ))}
        </ScrollView>
      ) : (
        <InputCurrency
          account={getAccount(form.destination, accounts)}
          currency={form.to ? form.to.currency : baseCurrency}
          showCurrency
          value={form.to ? form.exchange : undefined}
          onChange={(value) => handleField('exchange', value)}
          style={style.inputDestination}
        />
      )}
    </>
  );
};

FormTransaction.propTypes = {
  account: PropTypes.shape({}).isRequired,
  form: PropTypes.shape({}).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default FormTransaction;
