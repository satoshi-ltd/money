import { Button, Modal, Text, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

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

  const { accounts, createTx, deleteTx, settings: { colorCurrency } = {}, updateTx } = store;

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
      navigate('confirm', {
        caption: L10N.CONFIRM_DELETION_CAPTION,
        title: L10N.CONFIRM_DELETION,
        onAccept: async () => {
          await deleteTx({ hash });
          goBack();
        },
      });
    }

    if (!remove) goBack();
  };

  const { account, title = '', type = EXPENSE } = dataSource;
  const accountInfo = accounts.find(({ hash }) => hash === account);

  return (
    <Modal title="Clone" onClose={goBack}>
      <View row spaceBetween>
        <Text bold color="contentLight" secondary subtitle>
          {L10N.TRANSACTION[type]}
        </Text>
        <InputDate
          value={state.form.timestamp ? new Date(state.form.timestamp) : undefined}
          onChange={(value) =>
            setState((prevState) => ({ form: { ...prevState.form, timestamp: value.getTime() }, valid: true }))
          }
        />
      </View>
      <Text bold title style={style.title}>
        {title}
      </Text>

      {state.form?.category !== undefined && (
        <FormTransaction {...state} account={accountInfo} debounce={200} type={dataSource?.type} onChange={setState} />
      )}

      <View row style={style.buttons}>
        <Button flex outlined onPress={() => handleSubmit({ remove: true })}>
          {L10N.DELETE}
        </Button>
        <Button flex outlined onPress={() => handleSubmit({ clone: true })}>
          {L10N.CLONE}
        </Button>
        <Button disabled={!state.valid} flex secondary={!colorCurrency} onPress={() => handleSubmit({ edit: true })}>
          {L10N.SAVE}
        </Button>
      </View>
    </Modal>
  );
};

Clone.propTypes = {
  route: PropTypes.any,
  navigation: PropTypes.any,
};

export { Clone };
