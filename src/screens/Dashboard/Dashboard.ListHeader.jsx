import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import { getStyles } from './Dashboard.style';
import { queryAccounts } from './helpers';
import { Delta, Eyebrow, Heading, MonthSummary, Pressable, PriceFriendly, Text, View } from '../../components';
import { useApp, useStore } from '../../contexts';
import {
  buildInsights,
  getProgressionPercentage,
  isFlat,
  L10N,
  netWorthEyebrow,
  verboseDate,
} from '../../modules';

const DashboardListHeader = ({ navigate }) => {
  const store = useStore();
  const { colors } = useApp();
  const style = useMemo(() => getStyles(colors), [colors]);
  const { accounts = [], scheduledTxs = [], rates = {}, settings = {}, overall = {}, today, txs = [] } = store;
  const { baseCurrency, maskAmount } = settings || {};

  const sortedAccounts = queryAccounts({ accounts, query: undefined });
  const insights = useMemo(
    () =>
      buildInsights({
        accounts,
        now: today,
        scheduledTxs,
        rates,
        settings: { baseCurrency },
        txs,
      }),
    [accounts, scheduledTxs, rates, baseCurrency, today, txs],
  );
  const progression = getProgressionPercentage(overall?.currentBalance, overall?.currentMonth?.progression);
  const visibleAccounts = sortedAccounts.slice(0, 3);
  return (
    <>
      {accounts.length > 0 ? (
        <Pressable onPress={() => store.updateSettings?.({ maskAmount: !maskAmount })}>
          <View style={style.hero}>
            <Eyebrow>{netWorthEyebrow({ accounts: accounts.length, currency: baseCurrency })}</Eyebrow>
            <PriceFriendly
              bold
              currency={baseCurrency}
              size="hero"
              style={style.heroValue}
              value={overall?.currentBalance || 0}
            />
            <View row style={style.heroMeta}>
              <Delta caption={L10N.THIS_MONTH.toLowerCase()} value={progression} />
            </View>
          </View>
        </Pressable>
      ) : null}

      {insights.some(({ type }) => type === 'trend' || type === 'closed') ? (
        <View style={style.section}>
          <Heading
            eyebrow={verboseDate(new Date(today || Date.now()), {
              month: 'long',
            })}
            value={L10N.THIS_MONTH}
          />
          <MonthSummary currency={baseCurrency} insights={insights} />
        </View>
      ) : null}

      <View style={style.section}>
        <Heading value={L10N.ACCOUNTS}>
          <Pressable onPress={() => navigate('accounts')}>
            <Eyebrow>{`${L10N.SEE_ALL} ${accounts.length}`}</Eyebrow>
          </Pressable>
        </Heading>

        {visibleAccounts.map(({ currency, currentBalance, currentBalanceBase, currentMonth, hash, title }) => {
          const delta = getProgressionPercentage(currentBalance, currentMonth?.progressionCurrency);
          const showBase = baseCurrency && currency !== baseCurrency;

          return (
            <Pressable
              key={hash}
              onPress={() =>
                navigate('transactions', {
                  account: accounts.find((item) => item.hash === hash),
                })
              }
            >
              <View row style={style.accountRow}>
                <View flex style={style.accountText}>
                  <Text medium>{title}</Text>
                  <Text size="xxs" tone="muted">
                    {currency}
                  </Text>
                </View>
                <View style={style.accountRight}>
                  <PriceFriendly bold currency={currency} showSymbol size="lg" value={currentBalance} />
                  {showBase ? (
                    <PriceFriendly
                      currency={baseCurrency}
                      showSymbol
                      size="xs"
                      tone="muted"
                      value={currentBalanceBase || 0}
                    />
                  ) : !isFlat(delta) ? (
                    <Delta plain value={delta} />
                  ) : (
                    <Text figure="xs" tone="muted">
                      —
                    </Text>
                  )}
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={style.section}>
        <Heading value={L10N.TRANSACTIONS}>
          <Pressable onPress={() => navigate('transactions')}>
            <Eyebrow>{L10N.SEE_ALL}</Eyebrow>
          </Pressable>
        </Heading>
      </View>
    </>
  );
};

DashboardListHeader.displayName = 'DashboardListHeader';

DashboardListHeader.propTypes = {
  navigate: PropTypes.any,
};

export { DashboardListHeader };
