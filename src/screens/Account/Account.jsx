import { Button, Modal, Text, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import { style } from './Account.style';
import { InputCurrency, InputText, SliderCurrencies } from '../../components';
import { useStore } from '../../contexts';
import { C, eventEmitter, L10N } from '../../modules';
import { ServiceRates } from '../../services';

const { CURRENCY, EVENT } = C;

const INITIAL_STATE = { balance: 0, currency: undefined, title: undefined };

const Account = ({ route: { params = {} } = {}, navigation: { goBack, navigate } = {} }) => {
  const {
    settings: { baseCurrency, colorCurrency } = {},
    createAccount,
    updateAccount,
    deleteAccount,
    updateRates,
  } = useStore();

  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(INITIAL_STATE);

  const editMode = form.hash !== undefined;
  const { firstAccount, hash } = params;

  useEffect(() => {
    const { hash, balance, currency = baseCurrency, title } = params;

    setForm({ hash, balance, currency, title, valid: true });
  }, [baseCurrency, params]);

  const handleChange = (field, value) => {
    const next = { ...form, [field]: value };

    setForm({
      ...next,
      valid: next.currency !== undefined && next.title !== undefined,
    });
  };

  const handleDelete = async () => {
    navigate('confirm', {
      caption: L10N.CONFIRM_DELETION_CAPTION,
      title: L10N.CONFIRM_DELETION,
      onAccept: async () => {
        setBusy(true);
        await deleteAccount(params);

        eventEmitter.emit(EVENT.NOTIFICATION, { title: L10N.CONFIRM_DELETION_SUCCESS });
        goBack();
        goBack();
        setBusy(false);
      },
    });
  };

  const handleSubmit = async () => {
    setBusy(true);
    const method = editMode ? updateAccount : createAccount;

    const account = await method(form);
    if (firstAccount && form.currency !== CURRENCY) {
      const rates = await ServiceRates.get({ baseCurrency: form.currency, latest: false }).catch(() => {});
      if (rates) await updateRates(rates, form.currency);
    }
    if (account) {
      goBack();
      if (!editMode) navigate('transactions', { account });
    }

    setBusy(false);
  };

  return (
    <Modal onClose={firstAccount ? undefined : goBack}>
      <View style={style.title}>
        <Text bold secondary subtitle>
          {firstAccount ? L10N.FIRST_ACCOUNT : editMode ? L10N.SETTINGS : `${L10N.NEW} ${L10N.ACCOUNT}`}
        </Text>
        {firstAccount && (
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
        account={{ currency: form.currency }}
        label={L10N.INITIAL_BALANCE}
        value={form.balance}
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
        {hash && (
          <Button disabled={busy} flex outlined onPress={handleDelete}>
            {L10N.DELETE}
          </Button>
        )}
        {!firstAccount && (
          <Button disabled={busy} flex outlined onPress={goBack}>
            {L10N.CLOSE}
          </Button>
        )}
        <Button disabled={busy || !form.currency || !form.title} flex secondary={!colorCurrency} onPress={handleSubmit}>
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
