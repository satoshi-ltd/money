import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';

import { FormTransaction, FormTransfer } from './components';
import { createTransaction, createTransfer } from './helpers';
import { style } from './Transaction.style';
import { Button, Panel, View } from '../../components';
import { useStore } from '../../contexts';
import { C, L10N } from '../../modules';
import { sortAccounts } from '../../modules/sortAccounts';
import { PurchaseService } from '../../services';

const TIMEOUT = C?.TIMEOUT;
const TRANSFER = C?.TX?.TYPE?.TRANSFER ?? 0;
const ONE_DAY = 24 * 60 * 60 * 1000;

const INITIAL_STATE = { form: {}, valid: false };

const Transaction = ({ route: { params: { type, ...params } = {} } = {}, navigation: { goBack } = {} }) => {
  const store = useStore();
  const { accounts = [], subscription, txs = [], updateSubscription } = store;
  const initialType = type ?? C?.TX?.TYPE?.EXPENSE ?? 0;
  const [account, setAccount] = useState(params.account);
  const [accountTouched, setAccountTouched] = useState(false);
  const [categoryTouched, setCategoryTouched] = useState(false);
  const [amountTouched, setAmountTouched] = useState(false);
  const [typeAutoLocked, setTypeAutoLocked] = useState(false);
  const [txType, setTxType] = useState(initialType);
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
    if (type === TRANSFER) setState(INITIAL_STATE);
  }, [account, type]);

  const handleUserSelectAccount = (next) => {
    setAccountTouched(true);
    setAccount(next);
    setState(INITIAL_STATE);
    setCategoryTouched(false);
    setAmountTouched(false);
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

  const handleManualCategorySelect = () => setCategoryTouched(true);
  const handleManualAmountChange = () => setAmountTouched(true);

  const currentAccount = account || sortedAccounts[0];

  const handleSubmit = async () => {
    setBusy(true);
    setTimeout(async () => {
      const method = type === TRANSFER ? createTransfer : createTransaction;
      const value = await method({ props: { account: currentAccount, type: txType }, state, store });
      if (value) goBack();
      setBusy(false);

      if (subscription?.productIdentifier && txs.length) {
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
  const Form = type === TRANSFER ? FormTransfer : FormTransaction;
  const title =
    type === TRANSFER ? L10N.SWAP : txType === C?.TX?.TYPE?.INCOME ? L10N.INCOME : L10N.EXPENSE;

  return (
    <Panel offset title={title} onBack={goBack} disableScroll>
      {currentAccount ? (
        <Form
          {...{ account: currentAccount, type: txType }}
          {...(type !== TRANSFER
            ? {
                accountsList: sortedAccounts,
                onSelectAccount: handleUserSelectAccount,
                onAutoSelectAccount: handleAutoSelectAccount,
                onAutoSelectType: handleAutoSelectType,
                onManualCategorySelect: handleManualCategorySelect,
                onManualAmountChange: handleManualAmountChange,
                accountTouched,
                categoryTouched,
                amountTouched,
                typeTouched: false,
                typeAutoLocked,
                autoSuggest: true,
                showAccount: true,
              }
            : {})}
          {...(type === TRANSFER
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
        <Button disabled={busy} variant="outlined" onPress={goBack} grow>
          {L10N.CLOSE}
        </Button>
        <Button disabled={busy || !valid} onPress={handleSubmit} grow>
          {L10N.SAVE}
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
