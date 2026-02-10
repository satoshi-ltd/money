import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { style } from './Account.style';
import { Button, Heading, InputAmount, InputCurrency, InputField, Panel, Text, View } from '../../components';
import { useStore } from '../../contexts';
import { C, eventEmitter, L10N } from '../../modules';
import { ServiceRates } from '../../services';

const { CURRENCY, EVENT } = C;

const INITIAL_STATE = { balance: 0, currency: undefined, title: undefined };

const Account = ({ route: { params = {} } = {}, navigation: { goBack, navigate } = {} }) => {
  const { settings: { baseCurrency } = {}, createAccount, updateAccount, deleteAccount, updateRates } = useStore();
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
    Alert.alert(L10N.CONFIRM_DELETION, L10N.CONFIRM_ACCOUNT_DELETION_CAPTION, [
      { text: L10N.CANCEL, style: 'cancel' },
      {
        text: L10N.ACCEPT,
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          await deleteAccount(params);
          eventEmitter.emit(EVENT.NOTIFICATION, { title: L10N.CONFIRM_DELETION_SUCCESS });
          goBack();
          goBack();
          setBusy(false);
        },
      },
    ]);
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

  const headerTitle = firstAccount ? L10N.FIRST_ACCOUNT : editMode ? L10N.SETTINGS : `${L10N.NEW} ${L10N.ACCOUNT}`;

  return (
    <Panel offset title={headerTitle} onBack={firstAccount ? undefined : goBack}>
      {firstAccount && (
        <View style={style.title}>
          <Text tone="secondary" size="s">
            {L10N.FIRST_ACCOUNT_CAPTION}
          </Text>
        </View>
      )}

      <Heading value={L10N.DETAILS} />

      <InputCurrency first value={form.currency} onChange={(currency) => handleChange('currency', currency)} />

      <InputAmount
        account={{ currency: form.currency }}
        label={L10N.INITIAL_BALANCE}
        value={form.balance}
        onChange={(value) => handleChange('balance', value)}
      />

      <InputField last label={L10N.NAME} value={form.title} onChange={(value) => handleChange('title', value)} />

      <View row style={style.buttons}>
        {hash && (
          <Button disabled={busy} variant="outlined" onPress={handleDelete} grow>
            {L10N.DELETE}
          </Button>
        )}
        {!firstAccount && (
          <Button disabled={busy} variant="outlined" onPress={goBack} grow>
            {L10N.CLOSE}
          </Button>
        )}
        <Button disabled={busy || !form.currency || !form.title} onPress={handleSubmit} grow>
          {L10N.SAVE}
        </Button>
      </View>
    </Panel>
  );
};

Account.propTypes = {
  route: PropTypes.any,
  navigation: PropTypes.any,
};

export { Account };
