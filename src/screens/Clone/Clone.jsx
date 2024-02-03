import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import { style } from './Clone.style';
import { Button, Modal, Text, View } from '../../__design-system__';
import { useStore } from '../../contexts';
import { C, L10N } from '../../modules';
// ! TODO: Should be a /component
import { FormTransaction } from '../Transaction/components';

const {
  TX: {
    TYPE: { EXPENSE },
  },
} = C;

const INITIAL_STATE = { form: {}, valid: false };

const Clone = ({ route: { params = {} } = {}, navigation: { goBack, navigate } = {} }) => {
  const store = useStore();

  const { accounts, addTx, deleteTx, updateTx } = store;

  const [dataSource, setDataSource] = useState({});
  const [state, setState] = useState(INITIAL_STATE);

  useEffect(() => {
    const { category, title, value } = params;

    setDataSource(params);
    setState({ form: { category, title, value }, valid: false });
  }, [params]);

  const handleSubmit = async ({ remove, clone, edit }) => {
    // eslint-disable-next-line no-unused-vars
    const { hash, timestamp, ...tx } = dataSource;

    if (edit) await updateTx({ hash: dataSource.hash, ...state.form });
    else if (clone) await addTx({ ...tx });
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
      <Text bold color="contentLight" subtitle>
        {L10N.TRANSACTION[type]}
      </Text>
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
        <Button disabled={!state.valid} flex onPress={() => handleSubmit({ edit: true })}>
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
