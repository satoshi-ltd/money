import PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';

import { style } from './Dashboard.style';
import { queryAccounts } from './helpers';
import { Button, CardAccount, Heading, InputField, InsightsCarousel, ScrollView, View } from '../../components';
import { useStore } from '../../contexts';
import { buildInsights, getProgressionPercentage, ICON, L10N } from '../../modules';
import { cardAccountSnap } from '../../theme/layout';

let timeoutId;

const DashboardListHeader = ({ navigate, onSearch, setPage }) => {
  const { accounts = [], scheduledTxs = [], rates = {}, settings = {}, overall = {}, txs = [] } = useStore();
  const { baseCurrency } = settings || {};

  const [search, setSearch] = useState(false);
  const [query, setQuery] = useState();

  const handleSearch = () => {
    setSearch((prevSearch) => {
      setPage(1);
      onSearch();
      if (prevSearch) setQuery('');
      return !prevSearch;
    });
  };

  const onQueryChange = (value) => {
    setQuery(value);
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      onSearch(value);
    }, 350);
  };

  const sortedAccounts = queryAccounts({ accounts, query: undefined });
  const insights = useMemo(
    () => buildInsights({ accounts, scheduledTxs, rates, settings: { ...settings, baseCurrency }, txs }),
    [accounts, scheduledTxs, rates, settings, baseCurrency, txs],
  );
  const overallProgressionPercentage = useMemo(() => {
    const next = getProgressionPercentage(overall?.currentBalance, overall?.currentMonth?.progression);
    return Number.isFinite(next) ? next : undefined;
  }, [overall?.currentBalance, overall?.currentMonth?.progression]);
  const overallChartValues = useMemo(() => {
    const values = overall?.chartBalance;
    if (!Array.isArray(values)) return [];
    return values.slice(-6);
  }, [overall?.chartBalance]);

  const balanceCard = useMemo(
    () => ({
      title: L10N.TOTAL_BALANCE,
      value: overall?.currentBalance || 0,
      chartValues: overallChartValues,
      progressionPercentage: overallProgressionPercentage,
    }),
    [overall?.currentBalance, overallChartValues, overallProgressionPercentage],
  );

  const hasInsights = accounts.length > 0;

  return (
    <>
      {hasInsights ? (
        <>
          <View style={style.insightsHeading}>
            <Heading value={L10N.INSIGHTS} offset />
          </View>
          <InsightsCarousel balanceCard={balanceCard} currency={baseCurrency} insights={insights} />
        </>
      ) : null}

      <View style={style.accountsHeading}>
        <Heading value={L10N.ACCOUNTS} offset>
          <Button icon={ICON.NEW} variant="outlined" size="s" onPress={() => navigate('account', { create: true })} />
        </Heading>
      </View>

      <ScrollView horizontal snapTo={cardAccountSnap} style={[style.scrollView]}>
        {sortedAccounts.map((account, index) => {
          const {
            chartBalanceBase = [],
            currentBalance,
            currency,
            currentMonth: { progressionCurrency },
            hash,
            title,
          } = account;

          return (
            <CardAccount
              key={hash}
              balance={currentBalance}
              chart={chartBalanceBase}
              currency={currency}
              operator
              percentage={getProgressionPercentage(currentBalance, progressionCurrency)}
              style={[
                style.card,
                index === 0 && style.firstCard,
                index === sortedAccounts.length - 1 && style.lastCard,
              ]}
              title={title}
              onPress={() => navigate('transactions', { account })}
            />
          );
        })}
      </ScrollView>
      <View style={style.headingTight}>
        <Heading value={L10N.LAST_TRANSACTIONS} offset>
          <Button icon={!search ? ICON.SEARCH : ICON.CLOSE} variant="outlined" size="s" onPress={handleSearch} />
        </Heading>
      </View>
      {search && (
        <InputField
          first
          last
          placeholder={`${L10N.SEARCH}...`}
          value={query}
          onChange={onQueryChange}
          style={style.inputSearch}
        />
      )}
    </>
  );
};

DashboardListHeader.displayName = 'DashboardListHeader';

DashboardListHeader.propTypes = {
  navigate: PropTypes.any,
  onSearch: PropTypes.func,
  setPage: PropTypes.func,
};

export { DashboardListHeader };
