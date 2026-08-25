import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import { getStyles } from './Category.style';
import { AVERAGE_MONTHS, queryCategory } from './modules';
import { Delta, Eyebrow, Heading, Panel, Pressable, PriceFriendly, Text, View } from '../../components';
import { useApp, useStore } from '../../contexts';
import { C, L10N, percentText, verboseDate } from '../../modules';

const { TX: { TYPE: { EXPENSE } } = {} } = C;
const LATEST_LIMIT = 3;

const Category = ({ navigation: { goBack, navigate } = {}, route: { params = {} } = {} }) => {
  const { category, color, month, monthTotal = 0, type, year } = params;
  const store = useStore();
  const { colors } = useApp();
  const style = useMemo(() => getStyles(colors), [colors]);
  const { settings: { baseCurrency } = {} } = store;

  const { average, entries, merchants, total } = useMemo(
    () => queryCategory(store, { category, month, type, year }),
    [store, category, month, type, year],
  );

  const title = L10N.CATEGORIES[type]?.[category] || L10N.OTHERS;
  const share = monthTotal > 0 ? Math.round((total * 100) / monthTotal) : undefined;
  const delta = average > 0 ? Math.round(((total - average) / average) * 100) : undefined;
  const peak = merchants[0]?.value || 0;
  const latest = entries.slice(0, LATEST_LIMIT);

  return (
    <Panel sheet title={title} onBack={goBack}>
      <View row style={style.identity}>
        <View style={[style.dot, { backgroundColor: color || colors.accent }]} />
        <Text bold flex size="l">
          {title}
        </Text>
        <Eyebrow>{`${L10N.MONTHS[month]} · ${baseCurrency}`}</Eyebrow>
      </View>

      <View row style={style.hero}>
        <PriceFriendly bold currency={baseCurrency} size="xl" value={total} />
        {share !== undefined ? (
          <Text figure="sm" tone="muted">
            {`${percentText(share)} ${L10N.OF_SPEND}`}
          </Text>
        ) : null}
      </View>

      {delta !== undefined ? (
        <View row style={style.delta}>
          <Delta decimals={0} inverted plain value={delta} />
          <Text size="xs" tone="muted">
            {L10N.VS_YOUR_AVERAGE(AVERAGE_MONTHS)}
          </Text>
          <PriceFriendly currency={baseCurrency} size="xs" tone="muted" value={average} />
        </View>
      ) : null}

      <View style={style.section}>
        <Heading eyebrow={`${merchants.length} ${L10N.MERCHANTS}`} value={L10N.WHERE_IT_WENT} />
        {merchants.map(({ count, title: merchant, value }, index) => (
          <View key={`${merchant}-${index}`} row style={[style.row, index > 0 && style.divider]}>
            <Text flex medium numberOfLines={1}>
              {merchant}
            </Text>
            <View style={style.track}>
              <View style={[style.fill, { width: `${Math.max(2, Math.round((value * 100) / peak))}%` }]} />
            </View>
            <Text align="right" figure="xs" style={style.count} tone="muted">
              {`${count} ×`}
            </Text>
            <View style={style.amount}>
              <PriceFriendly currency={baseCurrency} size="md" value={value} />
            </View>
          </View>
        ))}
      </View>

      <View style={style.section}>
        <Heading value={L10N.LATEST}>
          <Pressable onPress={() => navigate('transactions')}>
            <Eyebrow>{`${L10N.SEE_ALL} ${entries.length}`}</Eyebrow>
          </Pressable>
        </Heading>

        {latest.map(({ account, hash, timestamp, title: label, value }, index) => (
          <View key={hash || index} row style={[style.row, index > 0 && style.divider]}>
            <Text figure="xs" style={style.date} tone="muted">
              {verboseDate(new Date(timestamp), { day: 'numeric', month: 'short' })}
            </Text>
            <View flex style={style.entryText}>
              <Text medium numberOfLines={1}>
                {label}
              </Text>
              <Text size="xxs" tone="muted" numberOfLines={1}>
                {account}
              </Text>
            </View>
            <PriceFriendly
              currency={baseCurrency}
              operator={type !== EXPENSE}
              size="md"
              value={type === EXPENSE ? -value : value}
            />
          </View>
        ))}
      </View>
    </Panel>
  );
};

Category.displayName = 'Category';

Category.propTypes = {
  navigation: PropTypes.any,
  route: PropTypes.any,
};

export { Category };
