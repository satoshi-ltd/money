import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import { getStyles } from './Scheduled.style';
import { Button, Eyebrow, Panel, Pressable, PriceFriendly, ScrollView, Text, View } from '../../components';
import { useApp, useStore } from '../../contexts';
import { C, exchange, getNextOccurrenceAt, ICON, L10N, monthlyImpact, verboseDate } from '../../modules';

const INCOME = C?.TX?.TYPE?.INCOME ?? 1;
const MS_IN_DAY = C?.MS_IN_DAY ?? 24 * 60 * 60 * 1000;
const NO_DATE = '—';

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
  const impact = useMemo(
    () => monthlyImpact({ accounts, baseCurrency, rates, scheduledTxs }),
    [accounts, baseCurrency, rates, scheduledTxs],
  );
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
    <Panel
      disableScroll
      offset
      style={style.screen}
      subtitle={`${scheduledTxs.length} ${L10N.SCHEDULED_ACTIVE}`}
      title={L10N.SCHEDULED}
      onBack={goBack}
      rightElement={<Button icon={ICON.ADD} variant="outlined" onPress={handleNew} />}
    >
      <ScrollView contentContainerStyle={style.content} style={style.list}>
        <View style={style.summary}>
          <Eyebrow>{`${L10N.SCHEDULED_IMPACT} · ${baseCurrency}`}</Eyebrow>
          <PriceFriendly bold operator currency={baseCurrency} size="xl" value={impact} />
          <Text size="xxs" tone="muted">
            {L10N.SCHEDULED_IMPACT_CAPTION}
          </Text>
        </View>

        {sections.length === 0 ? (
          <View style={style.empty}>
            <Text medium>{L10N.SCHEDULED_EMPTY}</Text>
            <Text size="s" tone="muted">
              {L10N.SCHEDULED_EMPTY_GUIDE}
            </Text>
          </View>
        ) : (
          sections.map((section) => (
            <View key={section.key} style={style.section}>
              <Eyebrow style={style.sectionTitle}>{section.title}</Eyebrow>

              {section.items.map(({ scheduled, nextAt }) => {
                const account = accountMap.get(scheduled.account);
                const currency = account?.currency;
                const isIncome = scheduled.type === INCOME;
                const signed = isIncome ? scheduled.value : -scheduled.value;
                const dated = Number.isFinite(nextAt);
                const base =
                  baseCurrency && currency && baseCurrency !== currency
                    ? exchange(scheduled.value, currency, baseCurrency, rates, nextAt || scheduled.startAt)
                    : undefined;

                return (
                  <Pressable key={scheduled.id} onPress={() => handleEdit(scheduled)}>
                    <View row style={style.row}>
                      <View style={style.when}>
                        <Eyebrow>
                          {dated ? verboseDate(new Date(nextAt), { locale: language, weekday: 'short' }) : ''}
                        </Eyebrow>
                        <Text figure="xs" tone="muted">
                          {dated
                            ? verboseDate(new Date(nextAt), { locale: language, day: 'numeric', month: 'short' })
                            : NO_DATE}
                        </Text>
                      </View>

                      <View flex style={style.text}>
                        <Text medium numberOfLines={1}>
                          {scheduled.title}
                        </Text>
                        <Text size="xxs" tone="muted" numberOfLines={1}>
                          {formatPattern(scheduled, language)}
                        </Text>
                      </View>

                      <View style={style.amount}>
                        <PriceFriendly
                          bold
                          currency={currency}
                          operator
                          showSymbol
                          size="md"
                          value={signed}
                        />
                        {base !== undefined ? (
                          <PriceFriendly
                            currency={baseCurrency}
                            showSymbol
                            size="xs"
                            tone="muted"
                            value={isIncome ? base : -base}
                          />
                        ) : null}
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ))
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
