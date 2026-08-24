import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import { getStyles } from './MonthSummary.style';
import { useApp } from '../../contexts';
import { L10N, percentText } from '../../modules';
import { Delta } from '../Delta';
import { Text, View } from '../../primitives';
import { PriceFriendly } from '../PriceFriendly';

const clamp = (value) => Math.max(0, Math.min(100, value));

const MonthSummary = ({ currency, insights = [], scheduled }) => {
  const { colors } = useApp();
  const style = useMemo(() => getStyles(colors), [colors]);

  const trend = insights.find((item) => item.type === 'trend' && item.meta?.spent !== undefined);
  const pace = insights.find(({ type }) => type === 'pace');
  const mover = insights.find(({ type }) => type === 'mover');

  const spent = trend?.meta?.spent;
  const baseline = trend?.meta?.baseline;
  const scale = Math.max(spent || 0, baseline || 0, 1);
  const overspend = baseline > 0 ? Math.max(0, (spent || 0) - baseline) : 0;

  // Nothing pending on a side is not worth a line of its own.
  const scheduledCaption = [
    scheduled?.credits ? `${scheduled.credits} ${scheduled.credits === 1 ? L10N.CREDIT : L10N.CREDITS}` : undefined,
    scheduled?.charges ? `${scheduled.charges} ${scheduled.charges === 1 ? L10N.CHARGE : L10N.CHARGES}` : undefined,
  ]
    .filter(Boolean)
    .join(' · ');

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

          <View row style={style.track}>
            <View style={[style.fill, { width: `${clamp((Math.min(spent, baseline || spent) / scale) * 100)}%` }]} />
            {overspend > 0 ? <View style={[style.excess, { width: `${clamp((overspend / scale) * 100)}%` }]} /> : null}
            {baseline > 0 ? <View style={[style.tick, { left: `${clamp((baseline / scale) * 100)}%` }]} /> : null}
          </View>

          <View row spaceBetween>
            <View row style={style.usual}>
              <Text size="xxs" tone="muted">
                {`${L10N.USUAL_BY} ${trend.meta.day} · `}
              </Text>
              <PriceFriendly currency={currency} size="xs" tone="muted" value={baseline} />
            </View>
            <Text medium size="xxs" tone={trend.value <= 0 ? 'positive' : undefined}>
              {`${percentText(Math.round(trend.value))} ${trend.value <= 0 ? L10N.BELOW_PACE : L10N.ABOVE_PACE}`}
            </Text>
          </View>
        </View>
      ) : null}

      {pace ? (
        <View row style={style.row}>
          <Text size="s" style={style.key} tone="muted">
            {L10N.ON_TRACK_FOR}
          </Text>
          <View flex>
            <PriceFriendly currency={currency} size="md" value={pace.value} />
          </View>
          <Text align="right" size="xs" style={style.context} tone="muted">
            {L10N.MONTH_END_ESTIMATE}
          </Text>
        </View>
      ) : null}

      {mover ? (
        <View row style={style.row}>
          <Text size="s" style={style.key} tone="muted">
            {L10N.BIGGEST_SWING}
          </Text>
          <View>
            <Delta decimals={0} inverted plain size="md" value={mover.value} />
          </View>
          <Text align="right" numberOfLines={2} size="xs" style={style.context} tone="muted">
            {mover.caption}
          </Text>
        </View>
      ) : null}

      {scheduled && scheduled.net !== 0 ? (
        <View row style={style.row}>
          <Text size="s" style={style.key} tone="muted">
            {L10N.SCHEDULED_AHEAD}
          </Text>
          <View flex>
            <PriceFriendly currency={currency} operator size="md" value={scheduled.net} />
          </View>
          <Text align="right" size="xs" style={style.context} tone="muted">
            {scheduledCaption}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

MonthSummary.propTypes = {
  currency: PropTypes.string,
  insights: PropTypes.array,
  scheduled: PropTypes.shape({ charges: PropTypes.number, credits: PropTypes.number, net: PropTypes.number }),
};

export { MonthSummary };
