import { Button, Panel, Text, View } from '../../components';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { style } from './Clone.style';
import { InputDate } from '../../components';
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

  useEffect(() => {
    const { category, title, timestamp, value } = params;

    setDataSource(params);
    setState({ form: { category, timestamp, title, value }, valid: false });
  }, [params]);

  const handleSubmit = async ({ remove, clone, edit }) => {
    // eslint-disable-next-line no-unused-vars
    const { hash, timestamp, ...tx } = dataSource;

    if (edit) await updateTx({ hash: dataSource.hash, ...state.form });
    else if (clone) await createTx({ ...tx });
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

  const { account, title = '', type = EXPENSE } = dataSource;
  const accountInfo = accounts.find(({ hash }) => hash === account);

  const headerTitle =
    type === C?.TX?.TYPE?.TRANSFER
      ? L10N.SWAP
      : type === C?.TX?.TYPE?.INCOME
        ? L10N.INCOME
        : L10N.EXPENSE;

  return (
    <Panel offset title={headerTitle} onBack={goBack}>
      {state.form?.category !== undefined && (
        <FormTransaction
          {...state}
          account={accountInfo}
          debounce={200}
          showDate
          type={dataSource?.type}
          onChange={setState}
        />
      )}

      <View row style={style.buttons}>
        <Button flex outlined onPress={() => handleSubmit({ remove: true })}>
          {L10N.DELETE}
        </Button>
        <Button flex outlined onPress={() => handleSubmit({ clone: true })}>
          {L10N.CLONE}
        </Button>
        <Button disabled={!state.valid} flex onPress={() => handleSubmit({ edit: true })}>
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
