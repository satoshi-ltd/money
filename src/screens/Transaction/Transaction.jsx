import { Button, Panel, Text, View } from '../../components';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import { FormTransaction, FormTransfer } from './components';
import { createTransaction, createTransfer } from './helpers';
import { style } from './Transaction.style';
import { SliderAccounts } from '../../components';
import { useStore } from '../../contexts';
import { C, L10N } from '../../modules';
import { PurchaseService } from '../../services';

const TIMEOUT = C?.TIMEOUT;
const TRANSFER = C?.TX?.TYPE?.TRANSFER ?? 0;
const ONE_DAY = 24 * 60 * 60 * 1000;

const INITIAL_STATE = { form: {}, valid: false };

const Transaction = ({ route: { params: { type, ...params } = {} } = {}, navigation: { goBack } = {} }) => {
  const store = useStore();
  const { subscription, txs = [], updateSubscription } = store;
  const [account, setAccount] = useState(params.account);
  const [busy, setBusy] = useState(false);
  // const [dataSource, setDataSource] = useState({});

  const [state, setState] = useState(INITIAL_STATE);

  useEffect(() => {
    // setAccount(params.account);
    // setState(INITIAL_STATE);
  }, [params]);

  useEffect(() => {
    setState(INITIAL_STATE);
  }, [account]);

  const handleSubmit = async () => {
    setBusy(true);
    setTimeout(async () => {
      const method = type === TRANSFER ? createTransfer : createTransaction;
      const value = await method({ props: { account, type }, state, store });
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

  return (
    <Panel offset title={L10N.TRANSACTION_TITLE} onBack={goBack}>

      {type !== TRANSFER && (
        <Text bold caption color="contentLight" style={style.title}>
          {account ? L10N.SELECT_CATEGORY : L10N.SELECT_ACCOUNT}
        </Text>
      )}

      {!account ? (
        <SliderAccounts selected={account?.hash} onChange={setAccount} />
      ) : (
        <Form {...{ account, type }} {...state} debounce={200} onChange={(value) => setState({ ...state, ...value })} />
      )}

      <View row style={style.buttons}>
        <Button disabled={busy} flex outlined onPress={goBack}>
          {L10N.CLOSE}
        </Button>
        <Button disabled={busy || !valid} flex onPress={handleSubmit}>
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
