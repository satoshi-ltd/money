import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';

import { FormTransaction, FormTransfer } from './components';
import { createTransaction, createTransfer } from './helpers';
import { style } from './Transaction.style';
import { Button, Panel, SegmentedToggle, View } from '../../components';
import { useStore } from '../../contexts';
import { C, frequentCategory, L10N, PREMIUM_ENABLED } from '../../modules';
import { sortAccounts } from '../../modules/sortAccounts';
import { PurchaseService } from '../../services';

const TIMEOUT = C?.TIMEOUT;
const EXPENSE = C?.TX?.TYPE?.EXPENSE ?? 0;
const INCOME = C?.TX?.TYPE?.INCOME ?? 1;
const TRANSFER = C?.TX?.TYPE?.TRANSFER ?? 2;
const ONE_DAY = 24 * 60 * 60 * 1000;

const INITIAL_STATE = { form: {}, valid: false };

const Transaction = ({ route: { params: { type, ...params } = {} } = {}, navigation: { goBack } = {} }) => {
  const store = useStore();
  const { accounts = [], subscription, txs = [], updateSubscription } = store;
  const initialType = type ?? EXPENSE;
  const [isTransfer, setIsTransfer] = useState(initialType === TRANSFER);
  const [account, setAccount] = useState(params.account);
  const [accountTouched, setAccountTouched] = useState(false);
  const [categoryTouched, setCategoryTouched] = useState(false);
  const [amountTouched, setAmountTouched] = useState(false);
  const [typeTouched, setTypeTouched] = useState(false);
  const [typeAutoLocked, setTypeAutoLocked] = useState(false);
  const [txType, setTxType] = useState(initialType === TRANSFER ? EXPENSE : initialType);
  const [busy, setBusy] = useState(false);
  // const [dataSource, setDataSource] = useState({});

  const [state, setState] = useState(INITIAL_STATE);

  const sortedAccounts = useMemo(() => sortAccounts(accounts), [accounts]);

  useEffect(() => {
    if (!account && sortedAccounts.length) setAccount(params.account || sortedAccounts[0]);
  }, [account, params.account, sortedAccounts]);

  useEffect(() => {
    // We want a clean form when the user manually changes account.
    // For transfers we keep the old behavior (reset on any account change).
    if (isTransfer) setState(INITIAL_STATE);
  }, [account, isTransfer]);

  useEffect(() => {
    if (isTransfer || categoryTouched) return;
    const suggested = frequentCategory({ account: account?.hash, txs, type: txType });
    if (suggested === undefined) return;

    setState((current) =>
      current.form.category === suggested ? current : { ...current, form: { ...current.form, category: suggested } },
    );
  }, [account?.hash, categoryTouched, isTransfer, txs, txType]);

  const handleUserSelectAccount = (next) => {
    setAccountTouched(true);
    setAccount(next);
    setCategoryTouched(false);
    setAmountTouched(false);
    setTypeTouched(false);
    setTypeAutoLocked(false);
  };

  const handleAutoSelectAccount = (next) => {
    setAccount(next);
  };

  const handleAutoSelectType = (nextType) => {
    if (typeAutoLocked) return;
    setTxType(nextType);
    setTypeAutoLocked(true);
  };

  const handleManualTypeChange = (nextType) => {
    if (nextType === txType) return;
    setTxType(nextType);
    setTypeTouched(true);
    setTypeAutoLocked(true);
    setCategoryTouched(false);
    setState((current) => ({
      ...current,
      form: { ...current.form, category: undefined },
      valid: false,
    }));
  };

  const handleManualCategorySelect = () => setCategoryTouched(true);
  const handleManualAmountChange = () => setAmountTouched(true);

  const currentAccount = account || sortedAccounts[0];

  const typeOptions = [
    { label: L10N.EXPENSE, value: EXPENSE },
    { label: L10N.INCOME, value: INCOME },
    ...(sortedAccounts.length > 1 ? [{ label: L10N.SWAP, value: TRANSFER }] : []),
  ];

  const handleModeChange = (next) => {
    if (next === TRANSFER) {
      if (!isTransfer) {
        setIsTransfer(true);
        setState(INITIAL_STATE);
      }
      return;
    }
    if (isTransfer) {
      setIsTransfer(false);
      setState(INITIAL_STATE);
      setTxType(next);
      return;
    }
    handleManualTypeChange(next);
  };

  const handleSubmit = async () => {
    setBusy(true);
    setTimeout(async () => {
      const method = isTransfer ? createTransfer : createTransaction;
      const value = await method({ props: { account: currentAccount, type: txType }, state, store });
      if (value) goBack();
      setBusy(false);

      if (PREMIUM_ENABLED && subscription?.productIdentifier && txs.length) {
        const lastTxDate = txs[txs.length - 1].timestamp;
        if (Date.now() - lastTxDate > ONE_DAY) {
          PurchaseService.checkSubscription(subscription).then((activeSubscription) => {
            if (!activeSubscription) {
              updateSubscription({});
            }
          });
        }
      }
    }, TIMEOUT.BUSY);
  };

  const { valid } = state;
  const Form = isTransfer ? FormTransfer : FormTransaction;
  const title = isTransfer ? L10N.SWAP : txType === INCOME ? L10N.INCOME : L10N.EXPENSE;

  return (
    <Panel offset sheet title={L10N.TRANSACTION} onBack={goBack}>
      <SegmentedToggle
        options={typeOptions}
        style={style.typeToggle}
        value={isTransfer ? TRANSFER : txType}
        onChange={handleModeChange}
      />
      {currentAccount ? (
        <Form
          {...{ account: currentAccount, type: txType }}
          {...(!isTransfer
            ? {
                accountsList: sortedAccounts,
                onSelectAccount: handleUserSelectAccount,
                onAutoSelectAccount: handleAutoSelectAccount,
                onAutoSelectType: handleAutoSelectType,
                onManualCategorySelect: handleManualCategorySelect,
                onManualAmountChange: handleManualAmountChange,
                onTypeChange: handleManualTypeChange,
                accountTouched,
                categoryTouched,
                amountTouched,
                typeTouched,
                typeAutoLocked,
                autoSuggest: true,
                showAccount: true,
                showType: false,
              }
            : {})}
          {...(isTransfer
            ? {
                accountsList: sortedAccounts,
                onSelectAccount: setAccount,
              }
            : {})}
          {...state}
          debounce={200}
          onChange={(value) => setState({ ...state, ...value })}
        />
      ) : null}

      <View row style={style.footer}>
        <Button disabled={busy || !valid} onPress={handleSubmit} grow>
          {`${L10N.SAVE} ${title.toLowerCase()}`}
        </Button>
      </View>
    </Panel>
  );
};

Transaction.displayName = 'Transaction';

Transaction.propTypes = {
  route: PropTypes.any,
  navigation: PropTypes.any,
};

export { Transaction };
