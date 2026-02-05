import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { style } from './Clone.style';
import { Button, Panel, View } from '../../components';
import { useStore } from '../../contexts';
import { C, L10N } from '../../modules';
import { FormTransaction } from '../Transaction/components'; // ! TODO: Should be a /component

const {
  TX: {
    TYPE: { EXPENSE },
  },
} = C;

const INITIAL_STATE = { form: {}, valid: false };

const Clone = ({ route: { params = {} } = {}, navigation: { goBack, navigate } = {} }) => {
  const store = useStore();
  const { accounts, createTx, deleteTx, updateTx } = store;
  const [dataSource, setDataSource] = useState({});
  const [state, setState] = useState(INITIAL_STATE);
  const [account, setAccount] = useState();
  const [baseline, setBaseline] = useState({ form: {}, accountHash: undefined });

  useEffect(() => {
    const { category, title, timestamp, value, account: accountHash } = params;
    const initialForm = { category, timestamp, title, value };

    setDataSource(params);
    setState({ form: initialForm, valid: false });
    setBaseline({ form: initialForm, accountHash });
    setAccount(undefined);
  }, [params]);

  useEffect(() => {
    if (!baseline.accountHash || account?.hash) return;
    const accountInfo = accounts.find(({ hash }) => hash === baseline.accountHash);
    if (accountInfo) setAccount(accountInfo);
  }, [accounts, account?.hash, baseline.accountHash]);

  const handleSubmit = async ({ remove, clone, edit }) => {
    // eslint-disable-next-line no-unused-vars
    const { hash, timestamp, ...tx } = dataSource;
    const accountHash = account?.hash || dataSource.account;
    const payload = { ...tx, ...state.form, account: accountHash };

    if (clone && state.form?.timestamp === baseline.form?.timestamp) {
      payload.timestamp = new Date().getTime();
    }

    if (edit) await updateTx({ hash: dataSource.hash, ...payload });
    else if (clone) await createTx(payload);
    else if (remove) {
      Alert.alert(L10N.CONFIRM_DELETION, L10N.CONFIRM_DELETION_CAPTION, [
        { text: L10N.CANCEL, style: 'cancel' },
        {
          text: L10N.ACCEPT,
          style: 'destructive',
          onPress: async () => {
            await deleteTx({ hash });
            goBack();
          },
        },
      ]);
    }

    if (!remove) goBack();
  };

  const { title = '', type = EXPENSE } = dataSource;

  const isDirty =
    ['category', 'timestamp', 'title', 'value'].some(
      (key) => (state.form?.[key] ?? undefined) !== (baseline.form?.[key] ?? undefined),
    ) || (account?.hash ?? undefined) !== (baseline.accountHash ?? undefined);

  const disableClone = isDirty || !account?.hash;

  const headerTitle =
    type === C?.TX?.TYPE?.TRANSFER ? L10N.SWAP : type === C?.TX?.TYPE?.INCOME ? L10N.INCOME : L10N.EXPENSE;

  return (
    <Panel offset title={headerTitle} onBack={goBack}>
      {state.form?.category !== undefined && (
        <FormTransaction
          {...state}
          account={account || {}}
          accountsList={accounts}
          debounce={200}
          showDate
          showAccount
          type={dataSource?.type}
          onChange={setState}
          onSelectAccount={setAccount}
        />
      )}

      <View row style={style.buttons}>
        <Button variant="outlined" onPress={() => handleSubmit({ remove: true })} grow>
          {L10N.DELETE}
        </Button>
        <Button disabled={disableClone} variant="outlined" onPress={() => handleSubmit({ clone: true })} grow>
          {L10N.CLONE}
        </Button>
        <Button disabled={!state.valid} onPress={() => handleSubmit({ edit: true })} grow>
          {L10N.SAVE}
        </Button>
      </View>
    </Panel>
  );
};

Clone.propTypes = {
  route: PropTypes.any,
  navigation: PropTypes.any,
};

export { Clone };
