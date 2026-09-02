import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import { getStyles } from './MonthSummary.style';
import { useApp } from '../../contexts';
import { L10N, percentText, verboseDate } from '../../modules';
import { Text, View } from '../../primitives';
import { PriceFriendly } from '../PriceFriendly';

const clamp = (value) => Math.max(0, Math.min(100, value));

// One line for all of them: title, value, caption. Written out five times over, they drifted a property at a time.
const Line = ({ currency, hint, label, operator = false, style, styleContainer, tone, value }) => (
  <View row style={[style.line, styleContainer]}>
    <Text size="s" style={style.key} tone="muted">
      {label}
    </Text>
    <View flex>
      <PriceFriendly currency={currency} operator={operator} size="md" tone={tone} value={value} />
    </View>
    {hint ? (
      <Text align="right" numberOfLines={1} size="xs" style={style.context} tone="muted">
        {hint}
      </Text>
    ) : null}
  </View>
);

Line.propTypes = {
  currency: PropTypes.string,
  hint: PropTypes.string,
  label: PropTypes.string,
  operator: PropTypes.bool,
  style: PropTypes.any,
  styleContainer: PropTypes.any,
  tone: PropTypes.string,
  value: PropTypes.number,
};

const MonthSummary = ({ currency, insights = [] }) => {
  const { colors } = useApp();
  const style = useMemo(() => getStyles(colors), [colors]);

  const trend = insights.find(({ type }) => type === 'trend');
  const closed = insights.find(({ type }) => type === 'closed');
  const swing = insights.find(({ type }) => type === 'swing');
  const incomes = insights.find(({ type }) => type === 'incomes');
  const scheduled = insights.find(({ type }) => type === 'scheduled');

  const spent = trend?.meta?.spent;
  // A percentage where enough of the month has run to earn one; a word where it would only overclaim.
  const pace =
    trend?.value !== undefined
      ? `${percentText(trend.value)} ${trend.meta.direction === 'under' ? L10N.BELOW_PACE : L10N.ABOVE_PACE}`
      : { over: L10N.ABOVE_USUAL, under: L10N.BELOW_USUAL, flat: L10N.AS_USUAL }[trend?.meta?.direction];
  const baseline = trend?.meta?.baseline;
  const scale = Math.max(spent || 0, baseline || 0, 1);
  const overspend = baseline > 0 ? Math.max(0, (spent || 0) - baseline) : 0;

  return (
    <View style={style.container}>
      {spent !== undefined ? (
        <View style={style.lead}>
          <Line currency={currency} hint={pace} label={L10N.SPENT_SO_FAR} style={style} value={spent} />

          {/* A ledger too young to have a baseline gets the figure and the date, and no bar to lie with. */}
          {baseline > 0 ? (
            <>
              <View row style={style.track}>
                <View style={[style.fill, { width: `${clamp((Math.min(spent, baseline) / scale) * 100)}%` }]} />
                {overspend > 0 ? <View style={[style.excess, { width: `${clamp((overspend / scale) * 100)}%` }]} /> : null}
                <View style={[style.tick, { left: `${clamp((baseline / scale) * 100)}%` }]} />
              </View>

              <View row style={style.usual}>
                <Text size="xxs" tone="muted">
                  {`${L10N.USUAL_BY} ${trend.meta.day} \u00b7 `}
                </Text>
                <PriceFriendly currency={currency} size="xs" tone="muted" value={baseline} />
              </View>
            </>
          ) : null}
        </View>
      ) : null}

      {closed ? (
        <Line
          currency={currency}
          hint={`${verboseDate(new Date(closed.meta.at), { month: 'long' })}${
            closed.meta.delta !== undefined ? ` \u00b7 ${percentText(closed.meta.delta)}` : ''
          }`}
          label={L10N.LAST_MONTH}
          style={style}
          styleContainer={style.row}
          value={closed.value}
        />
      ) : null}

      {incomes ? (
        <Line
          currency={currency}
          hint={incomes.meta.share ? `${incomes.meta.label} ${percentText(incomes.meta.share)}` : incomes.meta.label}
          label={L10N.INCOMES}
          style={style}
          styleContainer={style.row}
          value={incomes.value}
        />
      ) : null}

      {swing ? (
        <Line
          currency={currency}
          hint={swing.meta.label}
          label={L10N.SWING}
          operator
          style={style}
          styleContainer={style.row}
          tone={swing.value < 0 ? 'positive' : null}
          value={swing.value}
        />
      ) : null}

      {scheduled ? (
        <Line
          currency={currency}
          hint={`${scheduled.meta.pending} ${L10N.PENDING}`}
          label={L10N.SCHEDULED_AHEAD}
          operator
          style={style}
          styleContainer={style.row}
          value={scheduled.value}
        />
      ) : null}
    </View>
  );
};

MonthSummary.propTypes = {
  currency: PropTypes.string,
  insights: PropTypes.array,
};

export { MonthSummary };
