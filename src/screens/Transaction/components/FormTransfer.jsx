import { Heading, InputAccount, InputAmount } from '../../../components';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';

import { style } from './FormTransfer.style';
import { useStore } from '../../../contexts';
import { currencyDecimals, L10N } from '../../../modules';
import { getAccount, queryAvailableAccounts } from '../helpers';

const FormTransaction = ({ account = {}, form = {}, onChange }) => {
  const {
    accounts = [],
    settings: { baseCurrency },
    rates,
  } = useStore();

  const availableAccounts = queryAvailableAccounts(accounts, account);

  const fallback = availableAccounts[1] || availableAccounts[0];

  useEffect(() => {
    if ((!form.destination || form.from?.hash !== account?.hash) && fallback) {
      onChange({ form: { ...form, destination: fallback.hash, to: fallback, from: account } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, fallback?.hash]);

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

  return (
    <>
      <Heading value={L10N.DESTINATION} />
      <InputAccount
        accounts={availableAccounts}
        onSelect={(item) => handleField('destination', item.hash)}
        selected={getAccount(form.destination, accounts) || fallback}
      />

      <Heading value={L10N.DETAILS} />

      <InputAmount
        account={account}
        value={form.value}
        onChange={(value) => handleField('value', value)}
        style={style.inputCurrency}
      />
    </>
  );
};

FormTransaction.propTypes = {
  account: PropTypes.shape({}).isRequired,
  form: PropTypes.shape({}).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default FormTransaction;
