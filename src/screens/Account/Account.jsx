import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';

import { getStyles } from './Account.style';
import { Button, Heading, InputAmount, InputCurrency, InputField, Panel, Text, View } from '../../components';
import { useApp, useStore } from '../../contexts';
import { C, eventEmitter, L10N } from '../../modules';
import { rebaseRates, ServiceRates } from '../../services';

const { CURRENCY, EVENT } = C;

const INITIAL_STATE = { balance: 0, currency: undefined, title: undefined };

const Account = ({ route: { params = {} } = {}, navigation: { goBack, navigate } = {} }) => {
  const {
    rates = {},
    settings: { baseCurrency, lastRatesUpdate } = {},
    createAccount,
    updateAccount,
    deleteAccount,
    updateRates,
  } = useStore();
  const { colors } = useApp();
  const style = useMemo(() => getStyles(colors), [colors]);
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

  const handleDelete = () => {
    eventEmitter.emit(EVENT.CONFIRM, {
      title: L10N.CONFIRM_DELETION,
      caption: L10N.CONFIRM_ACCOUNT_DELETION_CAPTION,
      actionLabel: L10N.DELETE,
      onAction: async () => {
        setBusy(true);
        await deleteAccount(params);
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
      // The cached series converts to the new base offline; the network only tops up the current month.
      await updateRates(rebaseRates(rates, form.currency));

      const nextRates = await ServiceRates.get({ baseCurrency: form.currency, known: rates, lastRatesUpdate }).catch(
        () => {},
      );
      if (nextRates) await updateRates(nextRates);
    }
    if (account) {
      goBack();
      if (!editMode) navigate('transactions', { account });
    }

    setBusy(false);
  };

  const headerTitle = firstAccount ? L10N.FIRST_ACCOUNT : editMode ? L10N.SETTINGS : `${L10N.NEW} ${L10N.ACCOUNT}`;

  return (
    <Panel offset sheet title={headerTitle} onBack={firstAccount ? undefined : goBack}>
      {firstAccount ? (
        <Text size="s" tone="secondary" style={style.caption}>
          {L10N.FIRST_ACCOUNT_CAPTION}
        </Text>
      ) : null}

      <Heading value={L10N.DETAILS} />

      <View style={style.group}>
        <View row style={style.row}>
          <Text size="s" tone="muted" style={style.label}>
            {L10N.CURRENCY}
          </Text>
          <InputCurrency
            label={null}
            style={style.field}
            value={form.currency}
            onChange={(currency) => handleChange('currency', currency)}
          />
        </View>

        <View row style={[style.row, style.divider]}>
          <Text size="s" tone="muted" style={style.label}>
            {L10N.INITIAL_BALANCE}
          </Text>
          <InputAmount
            account={{ currency: form.currency }}
            label={null}
            style={style.field}
            value={form.balance}
            onChange={(value) => handleChange('balance', value)}
          />
        </View>

        <View row style={[style.row, style.divider]}>
          <Text size="s" tone="muted" style={style.label}>
            {L10N.NAME}
          </Text>
          <InputField style={style.field} value={form.title} onChange={(value) => handleChange('title', value)} />
        </View>
      </View>

      <View row style={style.buttons}>
        {hash ? (
          <Button disabled={busy} grow variant="dangerSoft" onPress={handleDelete}>
            {L10N.DELETE}
          </Button>
        ) : null}
        {!firstAccount ? (
          <Button disabled={busy} grow variant="outlined" onPress={goBack}>
            {L10N.CANCEL}
          </Button>
        ) : null}
        <Button disabled={busy || !form.currency || !form.title} grow onPress={handleSubmit}>
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
