import PropTypes from 'prop-types';
import React, { useEffect, useMemo } from 'react';

import { getStyles } from './Scheduled.style';
import { Button, Card, Icon, Panel, Pressable, PriceFriendly, Text, View } from '../../components';
import { useApp, useStore } from '../../contexts';
import { C, exchange, ICON, L10N } from '../../modules';

const INCOME = C?.TX?.TYPE?.INCOME ?? 1;

const LANGUAGE_TO_LOCALE = {
  de: 'de-DE',
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  pt: 'pt-PT',
};

const toLocale = (language) => {
  const key = `${language || 'en'}`.toLowerCase();
  return LANGUAGE_TO_LOCALE[key] || key;
};

const formatWeekdayList = (weekdays, language) => {
  const labels = weekdays.map((day) =>
    new Intl.DateTimeFormat(toLocale(language), { weekday: 'long' }).format(new Date(2023, 0, 1 + Number(day))),
  );

  try {
    return new Intl.ListFormat(toLocale(language), {
      style: 'long',
      type: 'conjunction',
    }).format(labels);
  } catch {
    return labels.join(', ');
  }
};

const formatPattern = (scheduled, language) => {
  const pattern = scheduled?.pattern || {};

  if (pattern.kind === 'monthly') {
    const day = pattern.byMonthDay || new Date(scheduled.startAt || Date.now()).getDate();
    if (typeof L10N.SCHEDULED_CAPTION_MONTHLY === 'function') {
      return L10N.SCHEDULED_CAPTION_MONTHLY({ day });
    }
    return `${L10N.SCHEDULED_PATTERN_MONTHLY}: ${day}`;
  }

  const weekdays =
    Array.isArray(pattern.byWeekday) && pattern.byWeekday.length
      ? pattern.byWeekday
      : [new Date(scheduled.startAt || Date.now()).getDay()];
  const orderedWeekdays = [...new Set(weekdays.map((day) => Number(day)).filter((day) => day >= 0 && day <= 6))].sort(
    (left, right) => left - right,
  );
  const labels = formatWeekdayList(
    orderedWeekdays.length ? orderedWeekdays : [new Date(scheduled.startAt || Date.now()).getDay()],
    language,
  );
  if (typeof L10N.SCHEDULED_CAPTION_WEEKLY === 'function') {
    return L10N.SCHEDULED_CAPTION_WEEKLY({ days: labels });
  }
  return `${L10N.SCHEDULED_PATTERN_WEEKLY}: ${labels}`;
};

const Scheduled = ({ navigation = {} }) => {
  const { goBack, navigate, replace } = navigation;
  const { colors, language } = useApp();
  const style = useMemo(() => getStyles(colors), [colors]);
  const { accounts = [], rates = {}, scheduledTxs = [], settings: { baseCurrency } = {} } = useStore();

  useEffect(() => {
    if (!scheduledTxs?.length && typeof replace === 'function') replace('scheduledForm', { create: true });
  }, [scheduledTxs?.length, replace]);

  const accountMap = useMemo(() => new Map(accounts.map((a) => [a.hash, a])), [accounts]);
  const sorted = useMemo(
    () => [...(scheduledTxs || [])].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)),
    [scheduledTxs],
  );

  const handleNew = () => navigate('scheduledForm', { create: true });
  const handleEdit = (scheduled) => navigate('scheduledForm', { id: scheduled.id });

  return (
    <Panel offset title={L10N.SCHEDULED} onBack={goBack}>
      {sorted.length === 0 ? null : (
        <>
          {sorted.map((scheduled) => {
            const account = accountMap.get(scheduled.account);
            const currency = account?.currency;
            const pattern = formatPattern(scheduled, language);
            const baseAmount =
              baseCurrency && currency && baseCurrency !== currency
                ? exchange(scheduled.value, currency, baseCurrency, rates, scheduled.startAt)
                : undefined;

            return (
              <View key={scheduled.id} style={style.item}>
                <Pressable onPress={() => handleEdit(scheduled)}>
                  <View row style={style.row}>
                    <Card size="s">
                      <Icon name={scheduled.type === INCOME ? ICON.INCOME : ICON.EXPENSE} />
                    </Card>
                    <View flex>
                      <Text bold numberOfLines={1}>
                        {scheduled.title}
                      </Text>
                      <Text size="s" tone="secondary">
                        {pattern}
                      </Text>
                    </View>
                    <View style={style.right}>
                      <PriceFriendly
                        bold
                        currency={currency}
                        tone={scheduled.type === INCOME ? 'accent' : undefined}
                        value={scheduled.value}
                      />
                      {baseAmount !== undefined ? (
                        <PriceFriendly currency={baseCurrency} size="s" tone="secondary" value={baseAmount} />
                      ) : null}
                    </View>
                  </View>
                </Pressable>
              </View>
            );
          })}
          <Button grow style={style.createButton} onPress={handleNew}>
            {L10N.SCHEDULED_NEW_CTA}
          </Button>
        </>
      )}
    </Panel>
  );
};

Scheduled.displayName = 'Scheduled';

Scheduled.propTypes = {
  navigation: PropTypes.any,
};

export { Scheduled };
