import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import { style } from './Clone.style';
import { cloneTx } from './helpers';
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

const Clone = ({ route: { params = {} } = {}, navigation: { goBack } = {} }) => {
  const store = useStore();

  const { updateTx, vaults } = store;

  const [busy, setBusy] = useState(false);
  const [dataSource, setDataSource] = useState({});
  const [state, setState] = useState(INITIAL_STATE);

  useEffect(() => {
    const { category, title, value } = params;

    setDataSource(params);
    setState({ form: { category, title, value }, valid: false });
  }, [params]);

  const handleSubmit = async ({ edit = false, wipe = false } = {}) => {
    setBusy(true);
    if (edit) {
      await updateTx({ hash: dataSource.hash, ...state.form });
    } else {
      await cloneTx({ dataSource, store, wipe });
    }
    setBusy(false);
    goBack();
  };

  const { vault, title = '', type = EXPENSE } = dataSource;
  const vaultInfo = vaults.find(({ hash }) => hash === vault);

  return (
    <Modal title="Clone" onClose={goBack}>
      <Text bold color="contentLight" subtitle>
        {L10N.TRANSACTION[type]}
      </Text>
      <Text bold title style={style.title}>
        {title}
      </Text>

      {state.form?.category !== undefined && (
        <FormTransaction {...state} debounce={200} vault={vaultInfo} type={dataSource?.type} onChange={setState} />
      )}

      <View row style={style.buttons}>
        <Button disabled={busy} flex outlined onPress={() => handleSubmit({ wipe: true })}>
          {L10N.WIPE}
        </Button>
        <Button disabled={busy} flex outlined onPress={() => handleSubmit()}>
          {L10N.CLONE}
        </Button>
        <Button disabled={busy || !state.valid} flex onPress={() => handleSubmit({ edit: true })}>
          {L10N.SAVE}
        </Button>
      </View>
    </Modal>
  );
};

Clone.displayName = 'Clone';

Clone.propTypes = {
  route: PropTypes.any,
  navigation: PropTypes.any,
};

export { Clone };
