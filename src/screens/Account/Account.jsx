import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

// import { Form } from './Account.Form';
import { style } from './Account.style';
import { Button, Modal, Text, View } from '../../__design-system__';
import { InputCurrency, InputText, SliderCurrencies } from '../../components';
import { useStore } from '../../contexts';
import { L10N } from '../../modules';

const INITIAL_STATE = { balance: 0, currency: undefined, title: undefined };

const Account = ({ route: { params = {} } = {}, navigation: { goBack, navigate } = {} }) => {
  const { addVault, updateVault, vaults = [] } = useStore();

  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(INITIAL_STATE);

  const editMode = form.hash !== undefined;

  useEffect(() => {
    const { hash, balance, currency, title } = params;

    setForm({ hash, balance, currency, title, valid: true });
  }, [params]);

  const handleChange = (field, value) => {
    const next = { ...form, [field]: value };

    setForm({
      ...next,
      valid: next.currency !== undefined && next.title !== undefined,
    });
  };

  const handleSubmit = async () => {
    setBusy(true);
    const method = editMode ? updateVault : addVault;

    const vault = await method(form);
    if (vault) {
      goBack();
      if (!editMode) navigate('transactions', { vault });
    }

    setBusy(false);
  };

  const isFirstAccount = vaults.length === 0;

  return (
    <Modal onClose={goBack}>
      <View style={style.title}>
        <Text bold subtitle>
          {isFirstAccount ? L10N.FIRST_ACCOUNT : editMode ? L10N.SETTINGS : `${L10N.NEW} ${L10N.ACCOUNT}`}
        </Text>
        {isFirstAccount && (
          <Text caption color="contentLight">
            {L10N.FIRST_ACCOUNT_CAPTION}
          </Text>
        )}
      </View>

      <SliderCurrencies
        selected={form.currency}
        onChange={(currency) => handleChange('currency', currency)}
        style={style.slider}
      />

      <InputCurrency
        label={L10N.INITIAL_BALANCE}
        value={form.balance}
        vault={{ currency: form.currency }}
        onChange={(value) => handleChange('balance', value)}
        style={style.inputCurrency}
      />

      <InputText
        label={L10N.NAME}
        value={form.title}
        onChange={(value) => handleChange('title', value)}
        style={style.inputTitle}
      />

      <View row style={style.buttons}>
        <Button disabled={busy} flex outlined onPress={goBack}>
          {L10N.CLOSE}
        </Button>
        <Button disabled={busy || !form.currency || !form.title} flex onPress={handleSubmit}>
          {L10N.SAVE}
        </Button>
      </View>
    </Modal>
  );
};

Account.propTypes = {
  route: PropTypes.any,
  navigation: PropTypes.any,
};

export { Account };
