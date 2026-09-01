import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Account } from './Onboarding.Account';
import { Cover } from './Onboarding.Cover';
import { Currency } from './Onboarding.Currency';
import { Passcode } from './Onboarding.Passcode';
import { getStyles } from './Onboarding.style';
import { Button, Eyebrow, Masthead, ScrollView, Text, View } from '../../components';
import { useApp, useStore } from '../../contexts';
import { C, eventEmitter, L10N } from '../../modules';
import { rebaseRates, ServiceRates } from '../../services';

const { CURRENCY, EVENT } = C;
const COVER = 0;
const STEP_CURRENCY = 1;
const STEP_ACCOUNT = 2;
const STEP_PASSCODE = 3;
const STEPS = 4;

const folio = (step) => `${`${step + 1}`.padStart(2, '0')} / ${`${STEPS}`.padStart(2, '0')}`;

const Onboarding = ({ navigation: { reset } = {} }) => {
  const { colors } = useApp();
  const { createAccount, rates = {}, settings = {}, updateRates, updateSettings } = useStore();
  const style = useMemo(() => getStyles(colors), [colors]);

  const [step, setStep] = useState(COVER);
  const [currency, setCurrency] = useState(settings.baseCurrency || CURRENCY);
  const [title, setTitle] = useState('');
  const [balance, setBalance] = useState('');
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (confirm.length < 4) return;

    if (confirm === pin) {
      finish(pin);
      return;
    }

    eventEmitter.emit(EVENT.NOTIFICATION, { error: true, title: L10N.ONB_PIN_MISMATCH });
    setPin('');
    setConfirm('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirm]);

  const finish = async (passcode) => {
    if (busy) return;
    setBusy(true);

    await updateSettings({ baseCurrency: currency, onboarded: true, pin: passcode });
    await createAccount({ balance: Number(balance) || 0, currency, title: title.trim() });

    reset({ index: 0, routes: [{ name: 'main' }] });
  };

  const handleCurrency = async (next) => {
    setCurrency(next);
    if (next === settings.baseCurrency) return;

    // The seeded series converts to any base without a request, so onboarding works with the network off.
    await updateRates(rebaseRates(rates, next));

    const nextRates = await ServiceRates.get({
      baseCurrency: next,
      known: rates,
      lastRatesUpdate: settings.lastRatesUpdate,
    })['catch'](() => undefined);
    if (nextRates) await updateRates(nextRates);
  };

  const isPasscode = step === STEP_PASSCODE;
  const confirming = pin.length === 4;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={style.screen}>
      <Masthead eyebrow="MÔNEY">
        <View row align="center" gap="xs">
          <Eyebrow>{L10N.ONB_SETUP}</Eyebrow>
          <Text figure="xs" tone="muted">
            {folio(step)}
          </Text>
        </View>
      </Masthead>

      {isPasscode ? (
        <View flex>
          <Passcode
            confirming={confirming}
            style={style}
            value={confirming ? confirm : pin}
            onChange={confirming ? setConfirm : setPin}
          />
        </View>
      ) : (
        <ScrollView contentContainerStyle={style.content} keyboardShouldPersistTaps="handled">
          {step === COVER ? <Cover style={style} /> : null}
          {step === STEP_CURRENCY ? (
            <Currency rates={rates} style={style} value={currency} onChange={handleCurrency} />
          ) : null}
          {step === STEP_ACCOUNT ? (
            <Account
              balance={balance}
              baseCurrency={settings.baseCurrency}
              currency={currency}
              style={style}
              title={title}
              onBalance={setBalance}
              onCurrency={() => setStep(STEP_CURRENCY)}
              onTitle={setTitle}
            />
          ) : null}
        </ScrollView>
      )}

      <View style={style.footer}>
        {step === STEP_CURRENCY ? (
          <Text size="xs" tone="muted">
            {L10N.ONB_CURRENCY_NOTE}
          </Text>
        ) : null}

        {isPasscode ? null : (
          <Button disabled={busy || (step === STEP_ACCOUNT && !title.trim())} onPress={() => setStep(step + 1)}>
            {step === COVER ? L10N.ONB_START : L10N.CONTINUE}
          </Button>
        )}

      </View>
    </SafeAreaView>
  );
};

Onboarding.displayName = 'Onboarding';

Onboarding.propTypes = {
  navigation: PropTypes.any,
};

export { Onboarding };
