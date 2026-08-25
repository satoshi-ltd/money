import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import { getStyles } from './MonthSummary.style';
import { useApp } from '../../contexts';
import { L10N, percentText } from '../../modules';
import { Text, View } from '../../primitives';
import { PriceFriendly } from '../PriceFriendly';

const clamp = (value) => Math.max(0, Math.min(100, value));

const MonthSummary = ({ currency, insights = [] }) => {
  const { colors } = useApp();
  const style = useMemo(() => getStyles(colors), [colors]);

  const trend = insights.find(({ type }) => type === 'trend');
  const swing = insights.find(({ type }) => type === 'swing');
  const incomes = insights.find(({ type }) => type === 'incomes');
  const scheduled = insights.find(({ type }) => type === 'scheduled');

  const spent = trend?.meta?.spent;
  const baseline = trend?.meta?.baseline;
  const scale = Math.max(spent || 0, baseline || 0, 1);
  const overspend = baseline > 0 ? Math.max(0, (spent || 0) - baseline) : 0;

  return (
    <View style={style.container}>
      {spent !== undefined ? (
        <View style={style.lead}>
          <View row spaceBetween style={style.leadHead}>
            <Text size="s" tone="secondary">
              {L10N.SPENT_SO_FAR}
            </Text>
            <PriceFriendly bold currency={currency} size="lg" value={spent} />
          </View>

          {/* A ledger too young to have a baseline gets the figure and the date, and no bar to lie with. */}
          {baseline > 0 ? (
            <>
              <View row style={style.track}>
                <View style={[style.fill, { width: `${clamp((Math.min(spent, baseline) / scale) * 100)}%` }]} />
                {overspend > 0 ? <View style={[style.excess, { width: `${clamp((overspend / scale) * 100)}%` }]} /> : null}
                <View style={[style.tick, { left: `${clamp((baseline / scale) * 100)}%` }]} />
              </View>

              <View row spaceBetween>
                <View row style={style.usual}>
                  <Text size="xxs" tone="muted">
                    {`${L10N.USUAL_BY} ${trend.meta.day} \u00b7 `}
                  </Text>
                  <PriceFriendly currency={currency} size="xs" tone="muted" value={baseline} />
                </View>
                <Text medium size="xxs" tone={trend.meta.direction === 'under' ? 'positive' : undefined}>
                  {`${percentText(trend.value)} ${trend.meta.direction === 'under' ? L10N.BELOW_PACE : L10N.ABOVE_PACE}`}
                </Text>
              </View>
            </>
          ) : null}
        </View>
      ) : null}

      {incomes ? (
        <View row style={style.row}>
          <Text size="s" style={style.key} tone="muted">
            {L10N.INCOMES}
          </Text>
          <View flex>
            <PriceFriendly currency={currency} size="md" value={incomes.value} />
          </View>
          <Text align="right" numberOfLines={1} size="xs" style={style.context} tone="muted">
            {incomes.meta.share ? `${incomes.meta.label} ${percentText(incomes.meta.share)}` : incomes.meta.label}
          </Text>
        </View>
      ) : null}

      {swing ? (
        <View row style={style.row}>
          <Text size="s" style={style.key} tone="muted">
            {L10N.SWING}
          </Text>
          <View flex>
            <PriceFriendly
              currency={currency}
              operator
              size="md"
              tone={swing.value < 0 ? 'positive' : null}
              value={swing.value}
            />
          </View>
          <Text align="right" numberOfLines={1} size="xs" style={style.context} tone="muted">
            {swing.meta.label}
          </Text>
        </View>
      ) : null}

      {scheduled ? (
        <View row style={style.row}>
          <Text size="s" style={style.key} tone="muted">
            {L10N.SCHEDULED_AHEAD}
          </Text>
          <View flex>
            <PriceFriendly currency={currency} operator size="md" value={scheduled.value} />
          </View>
          <Text align="right" numberOfLines={1} size="xs" style={style.context} tone="muted">
            {`${scheduled.meta.pending} ${L10N.PENDING}`}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

MonthSummary.propTypes = {
  currency: PropTypes.string,
  insights: PropTypes.array,
};

export { MonthSummary };
