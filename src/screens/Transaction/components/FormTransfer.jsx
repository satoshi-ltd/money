import PropTypes from 'prop-types';
import React, { useEffect, useRef } from 'react';

import { Heading, InputAccount, InputAmount } from '../../../components';
import { useStore } from '../../../contexts';
import { currencyDecimals, L10N } from '../../../modules';
import { getAccount, queryAvailableAccounts } from '../helpers';

const FormTransaction = ({ account = {}, accountsList = [], form = {}, onChange, onSelectAccount }) => {
  const {
    accounts = [],
    settings: { baseCurrency },
    rates,
  } = useStore();

  const lastEditedRef = useRef('value');

  const resolvedAccounts = accountsList.length ? accountsList : accounts;
  const availableAccounts = queryAvailableAccounts(resolvedAccounts, account);

  const fallback = availableAccounts[1] || availableAccounts[0];

  useEffect(() => {
    if ((!form.destination || form.from?.hash !== account?.hash) && fallback) {
      onChange({ form: { ...form, destination: fallback.hash, to: fallback, from: account } });
    }
  }, [account, fallback, form, onChange]);

  const getLatestRates = () => {
    const keys = Object.keys(rates || {});
    return keys.length ? rates[keys[keys.length - 1]] : undefined;
  };

  const computeExchangeAuto = ({ from, to, value }) => {
    const latestRates = getLatestRates();
    if (!from?.currency || !to?.currency || !latestRates) return undefined;

    if (!Number.isFinite(value) || value <= 0) return undefined;

    let exchange = 0;
    if (from.currency === to.currency) exchange = value;
    else if (from.currency === baseCurrency) exchange = value * latestRates[to.currency];
    else if (to.currency === baseCurrency) exchange = value / latestRates[from.currency];
    else exchange = (value / latestRates[from.currency]) * latestRates[to.currency];

    return parseFloat(exchange, 10).toFixed(currencyDecimals(exchange, to.currency));
  };

  const handleField = (field, fieldValue) => {
    const prevEdited = lastEditedRef.current;
    if (field === 'value') lastEditedRef.current = 'value';
    if (field === 'exchange') lastEditedRef.current = 'exchange';

    const next = { ...form, [field]: fieldValue };
    const from = getAccount(account.hash, resolvedAccounts);
    const to = getAccount(next.destination, resolvedAccounts);
    const nextValue = typeof next.value === 'string' ? parseFloat(next.value) : next.value;
    const prevValue = typeof form.value === 'string' ? parseFloat(form.value) : form.value;
    const prevExchange = typeof form.exchange === 'string' ? parseFloat(form.exchange) : form.exchange;

    let exchange = next.exchange;

    if (next.destination && to?.currency && from?.currency && field === 'destination') {
      lastEditedRef.current = 'value';
      exchange = computeExchangeAuto({ from, to, value: nextValue });
    } else if (next.destination && to?.currency && from?.currency && field === 'value') {
      if (
        prevEdited === 'exchange' &&
        Number.isFinite(prevValue) &&
        prevValue > 0 &&
        Number.isFinite(prevExchange) &&
        prevExchange > 0 &&
        Number.isFinite(nextValue)
      ) {
        const rate = prevExchange / prevValue;
        const computed = nextValue * rate;
        exchange = parseFloat(computed, 10).toFixed(currencyDecimals(computed, to.currency));
      } else {
        exchange = computeExchangeAuto({ from, to, value: nextValue });
      }
    }

    onChange({
      form: { ...next, from, to, exchange },
      valid: Number.isFinite(nextValue) && nextValue > 0 && next.destination !== undefined && Number(exchange) > 0,
    });
  };

  const destinationAccount = getAccount(form.destination, resolvedAccounts) || fallback;

  return (
    <>
      <Heading value={L10N.FROM_ACCOUNT} />

      <InputAccount accounts={resolvedAccounts} first onSelect={(item) => onSelectAccount?.(item)} selected={account} />

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
