import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import { FormTransaction, FormTransfer } from './components';
import { createTransaction, createTransfer } from './helpers';
import { style } from './Transaction.style';
import { Button, Modal, Text, View } from '../../__design-system__';
import { useStore } from '../../contexts';
import { C, L10N } from '../../modules';
import { PurchaseService } from '../../services';

const {
  TIMEOUT,
  TX: {
    TYPE: { TRANSFER },
  },
} = C;
const ONE_DAY = 24 * 60 * 60 * 1000;

const INITIAL_STATE = { form: {}, valid: false };

const Transaction = ({ route: { params = {} } = {}, navigation: { goBack } = {} }) => {
  const store = useStore();
  const { subscription, txs = [], updateSubscription } = store;

  const [busy, setBusy] = useState(false);
  const [dataSource, setDataSource] = useState({});

  const [state, setState] = useState(INITIAL_STATE);

  useEffect(() => {
    const { type, vault } = params;
    setDataSource({ type, vault });
    setState(INITIAL_STATE);
  }, [params]);

  const handleSubmit = async () => {
    setBusy(true);
    setTimeout(async () => {
      const method = type === TRANSFER ? createTransfer : createTransaction;
      const value = await method({ props: dataSource, state, store });
      if (value) goBack();
      setBusy(false);

      if (subscription?.productId && txs.length) {
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

  const { type } = dataSource;
  const { valid } = state;

  const Form = type === TRANSFER ? FormTransfer : FormTransaction;

  return (
    <Modal onClose={goBack}>
      <Text bold subtitle style={style.title}>
        {L10N.TRANSACTION[type]}
      </Text>

      {type !== undefined && (
        <Form {...dataSource} {...state} debounce={200} onChange={(value) => setState({ ...state, ...value })} />
      )}

      <View row style={style.buttons}>
        <Button disabled={busy} flex outlined onPress={goBack}>
          {L10N.CLOSE}
        </Button>
        <Button disabled={busy || !valid} flex onPress={handleSubmit}>
          {L10N.SAVE}
        </Button>
      </View>
    </Modal>
  );
};

Transaction.displayName = 'Transaction';

Transaction.propTypes = {
  route: PropTypes.any,
  navigation: PropTypes.any,
};

export { Transaction };
