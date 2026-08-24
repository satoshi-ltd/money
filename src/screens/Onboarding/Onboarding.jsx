import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Account } from './Onboarding.Account';
import { Cover } from './Onboarding.Cover';
import { Currency } from './Onboarding.Currency';
import { Passcode } from './Onboarding.Passcode';
import { getStyles } from './Onboarding.style';
import { Button, Eyebrow, Masthead, Pressable, ScrollView, Text, View } from '../../components';
import { useApp, useStore } from '../../contexts';
import { C, eventEmitter, L10N } from '../../modules';
import { ServiceRates } from '../../services';

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
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (pin.length === 4) finish(pin);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  const finish = async (passcode) => {
    if (busy) return;
    setBusy(true);

    await updateSettings({ baseCurrency: currency, onboarded: true, ...(passcode ? { pin: passcode } : {}) });
    if (title.trim()) await createAccount({ balance: Number(balance) || 0, currency, title: title.trim() });

    reset({ index: 0, routes: [{ name: 'main' }] });
  };

  const handleCurrency = async (next) => {
    setCurrency(next);
    if (next === rates.currency) return;

    const nextRates = await ServiceRates.get({ baseCurrency: next, latest: false })['catch'](() => undefined);
    if (nextRates) await updateRates({ ...nextRates, currency: next });
    else eventEmitter.emit(EVENT.NOTIFICATION, { error: true, title: L10N.ERROR_SERVICE_RATES });
  };

  const isPasscode = step === STEP_PASSCODE;

  const handleSkip = () => {
    if (isPasscode) return finish();
    setTitle('');
    setBalance('');
    setStep(STEP_PASSCODE);
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={style.screen}>
      <Masthead eyebrow={step === COVER ? 'môney' : `môney · ${L10N.ONB_SETUP}`}>
        {step === COVER ? (
          <Eyebrow>{L10N.ONB_EST}</Eyebrow>
        ) : (
          <Text figure="xs" tone="muted">
            {folio(step)}
          </Text>
        )}
      </Masthead>

      {isPasscode ? (
        <View flex>
          <Passcode style={style} value={pin} onChange={setPin} />
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
          <Button disabled={busy} onPress={() => setStep(step + 1)}>
            {step === COVER ? L10N.ONB_START : L10N.CONTINUE}
          </Button>
        )}

        {step === COVER ? (
          <View row style={style.footerMeta}>
            <Text figure="xs" tone="muted">
              {folio(step)}
            </Text>
            <Eyebrow>{L10N.ONB_COVER_FOOTNOTE}</Eyebrow>
          </View>
        ) : null}

        {step === STEP_ACCOUNT || isPasscode ? (
          <Pressable disabled={busy} style={style.footerCentered} onPress={handleSkip}>
            <Eyebrow>{isPasscode ? L10N.ONB_PIN_SKIP : L10N.ONB_SKIP}</Eyebrow>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
};

Onboarding.displayName = 'Onboarding';

Onboarding.propTypes = {
  navigation: PropTypes.any,
};

export { Onboarding };
