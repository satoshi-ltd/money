import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import { getStyles } from './Scheduled.style';
import { Button, Card, Icon, Panel, Pressable, PriceFriendly, ScrollView, Text, View } from '../../components';
import { useApp, useStore } from '../../contexts';
import { C, exchange, getNextOccurrenceAt, ICON, L10N } from '../../modules';

const INCOME = C?.TX?.TYPE?.INCOME ?? 1;
const MS_IN_DAY = C?.MS_IN_DAY ?? 24 * 60 * 60 * 1000;

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
  const { goBack, navigate } = navigation;
  const { colors, language } = useApp();
  const style = useMemo(() => getStyles(colors), [colors]);
  const { accounts = [], rates = {}, scheduledTxs = [], settings: { baseCurrency } = {} } = useStore();

  const accountMap = useMemo(() => new Map(accounts.map((a) => [a.hash, a])), [accounts]);
  const now = Date.now();

  const enriched = useMemo(
    () =>
      [...(scheduledTxs || [])]
        .map((scheduled) => ({
          scheduled,
          nextAt: getNextOccurrenceAt({ scheduled, afterAt: now }),
        }))
        .sort((a, b) => {
          const left = Number.isFinite(a.nextAt) ? a.nextAt : Number.MAX_SAFE_INTEGER;
          const right = Number.isFinite(b.nextAt) ? b.nextAt : Number.MAX_SAFE_INTEGER;
          if (left !== right) return left - right;
          return (b.scheduled.updatedAt || 0) - (a.scheduled.updatedAt || 0);
        }),
    [now, scheduledTxs],
  );

  const sections = useMemo(() => {
    const next7Limit = now + MS_IN_DAY * 7;
    const nowDate = new Date(now);
    const month = nowDate.getMonth();
    const year = nowDate.getFullYear();

    const grouped = { upcoming: [], month: [], later: [] };
    enriched.forEach((item) => {
      if (!Number.isFinite(item.nextAt)) {
        grouped.later.push(item);
        return;
      }
      if (item.nextAt <= next7Limit) {
        grouped.upcoming.push(item);
        return;
      }
      const nextDate = new Date(item.nextAt);
      if (nextDate.getMonth() === month && nextDate.getFullYear() === year) grouped.month.push(item);
      else grouped.later.push(item);
    });

    return [
      { key: 'upcoming', title: L10N.SCHEDULED_SECTION_UPCOMING, items: grouped.upcoming },
      { key: 'month', title: L10N.SCHEDULED_SECTION_MONTH, items: grouped.month },
      { key: 'later', title: L10N.SCHEDULED_SECTION_LATER, items: grouped.later },
    ].filter((section) => section.items.length > 0);
  }, [enriched, now]);

  const handleNew = () => navigate('scheduledForm', { create: true });
  const handleEdit = (scheduled) => navigate('scheduledForm', { id: scheduled.id });

  return (
    <Panel offset title={L10N.SCHEDULED} onBack={goBack} disableScroll>
      <ScrollView contentContainerStyle={style.content}>
        <Button grow style={style.topCta} onPress={handleNew}>
          {L10N.SCHEDULED_ADD_CTA}
        </Button>

        {sections.length === 0 ? (
          <Card style={style.emptyCard}>
            <View row style={style.emptyHeader}>
              <Card size="s">
                <Icon name={ICON.SCHEDULED} />
              </Card>
              <View flex>
                <Text bold>{L10N.SCHEDULED_EMPTY}</Text>
                <Text size="s" tone="secondary">
                  {L10N.SCHEDULED_EMPTY_GUIDE}
                </Text>
              </View>
            </View>
          </Card>
        ) : (
          <>
            {sections.map((section) => (
              <View key={section.key} style={style.section}>
                <Text bold size="m" style={style.sectionTitle}>
                  {section.title}
                </Text>

                {section.items.map(({ scheduled, nextAt }) => {
                  const account = accountMap.get(scheduled.account);
                  const currency = account?.currency;
                  const pattern = formatPattern(scheduled, language);
                  const baseAmount =
                    baseCurrency && currency && baseCurrency !== currency
                      ? exchange(scheduled.value, currency, baseCurrency, rates, nextAt || scheduled.startAt)
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
                            <Text size="s" tone="secondary" numberOfLines={1}>
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
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </Panel>
  );
};

Scheduled.displayName = 'Scheduled';

Scheduled.propTypes = {
  navigation: PropTypes.any,
};

export { Scheduled };
