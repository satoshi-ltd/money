import { Heading, InputAccount, InputAmount } from '../../../components';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';

import { useStore } from '../../../contexts';
import { currencyDecimals, L10N } from '../../../modules';
import { getAccount, queryAvailableAccounts } from '../helpers';

const FormTransaction = ({ account = {}, accountsList = [], form = {}, onChange, onSelectAccount }) => {
  const {
    accounts = [],
    settings: { baseCurrency },
    rates,
  } = useStore();

  const resolvedAccounts = accountsList.length ? accountsList : accounts;
  const availableAccounts = queryAvailableAccounts(resolvedAccounts, account);

  const fallback = availableAccounts[1] || availableAccounts[0];

  useEffect(() => {
    if ((!form.destination || form.from?.hash !== account?.hash) && fallback) {
      onChange({ form: { ...form, destination: fallback.hash, to: fallback, from: account } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, fallback?.hash]);

  const handleField = (field, fieldValue) => {
    const next = { ...form, [field]: fieldValue };
    const from = getAccount(account.hash, resolvedAccounts);
    const to = getAccount(next.destination, resolvedAccounts);
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

  const destinationAccount = getAccount(form.destination, resolvedAccounts) || fallback;

  return (
    <>
      <Heading value={L10N.FROM_ACCOUNT} />

      <InputAccount
        accounts={resolvedAccounts}
        first
        onSelect={(item) => onSelectAccount?.(item)}
        selected={account}
      />

      <InputAmount
        account={account}
        last
        label={L10N.SEND}
        value={form.value}
        onChange={(value) => handleField('value', value)}
      />

      <Heading value={L10N.DESTINATION} />

      <InputAccount
        accounts={availableAccounts}
        first
        onSelect={(item) => handleField('destination', item.hash)}
        selected={destinationAccount}
      />

      <InputAmount
        account={destinationAccount}
        last
        label={L10N.RECEIVE}
        value={form.exchange}
        onChange={(value) => handleField('exchange', value)}
        editable={false}
      />
    </>
  );
};

FormTransaction.propTypes = {
  account: PropTypes.shape({}).isRequired,
  accountsList: PropTypes.arrayOf(PropTypes.shape({})),
  form: PropTypes.shape({}).isRequired,
  onChange: PropTypes.func.isRequired,
  onSelectAccount: PropTypes.func,
};

export default FormTransaction;
