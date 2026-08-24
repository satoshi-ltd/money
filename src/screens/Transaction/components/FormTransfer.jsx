import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';

import { Dropdown, FieldRow, Input, PriceFriendly, Text, View } from '../../../components';
import { useStore } from '../../../contexts';
import { currencySymbol, L10N, roundToCurrency } from '../../../modules';
import { computeTransferExchange, getAccount, queryAvailableAccounts } from '../helpers';
import { style } from './FormTransaction.style';

const FormTransaction = ({ account = {}, accountsList = [], form = {}, onChange, onSelectAccount }) => {
  const {
    accounts = [],
    settings: { baseCurrency },
    rates,
  } = useStore();

  const [open, setOpen] = useState();
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

  const computeExchangeAuto = ({ from, to, value }) =>
    computeTransferExchange({ baseCurrency, from, latestRates: getLatestRates(), to, value });

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
        exchange = from.currency === to.currency ? nextValue : roundToCurrency(nextValue * rate, to.currency);
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

  const accountRow = (label, selected, options, onSelect, key, divider) => (
    <View style={[style.rowWrap, open === key && style.rowWrapOpen]}>
      <FieldRow chevron divider={divider} label={label} onPress={() => setOpen(key)}>
        <Text medium numberOfLines={1} size="s">
          {`${selected?.title} ·`}
        </Text>
        <PriceFriendly currency={selected?.currency} size="md" value={selected?.currentBalance || 0} />
      </FieldRow>
      <Dropdown
        options={options.map((item) => ({ account: item, id: item.hash, label: item.title, symbol: item.currency, value: item.hash }))}
        selected={selected?.hash}
        visible={open === key}
        onClose={() => setOpen(undefined)}
        onSelect={(option) => {
          setOpen(undefined);
          onSelect(option.account);
        }}
      />
    </View>
  );

  const amountRow = (label, selected, value, field) => (
    <FieldRow divider label={label}>
      <Input
        keyboardType="decimal-pad"
        placeholder="0"
        style={style.rowFigure}
        value={value !== undefined ? `${value}` : undefined}
        onChange={(next) => handleField(field, next)}
      />
      <Text figure="sm" tone="muted">
        {currencySymbol(selected?.currency)}
      </Text>
    </FieldRow>
  );

  return (
    <View style={style.group}>
      {accountRow(L10N.FROM_ACCOUNT, account, resolvedAccounts, (item) => onSelectAccount?.(item), 'from', false)}
      {amountRow(L10N.SEND, account, form.value, 'value')}
      {accountRow(
        L10N.DESTINATION,
        destinationAccount,
        availableAccounts,
        (item) => handleField('destination', item.hash),
        'to',
      )}
      {amountRow(L10N.RECEIVE, destinationAccount, form.exchange, 'exchange')}
    </View>
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
