import { Button, Card, Icon, InputField, LineChart, MetricBar, PriceFriendly, ScrollView, Text, View } from '../../components';
import PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';
import StyleSheet from 'react-native-extended-stylesheet';

import { style } from './Dashboard.style';
import { queryAccounts } from './helpers';
import { CardAccount, Heading, Summary } from '../../components';
import { useStore } from '../../contexts';
import { buildInsights, getProgressionPercentage, ICON, L10N } from '../../modules';

let timeoutId;

const DashboardListHeader = ({ navigate, onSearch, setPage }) => {
  const { accounts = [], rates = {}, settings: { baseCurrency } = {}, overall = {}, txs = [] } = useStore();

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
    () => buildInsights({ accounts, rates, settings: { baseCurrency }, txs }),
    [accounts, rates, baseCurrency, txs],
  );
  const previewInsights = insights;
  const hasInsights = previewInsights.length > 0;

  const formatSignedPercent = (value = 0) => `${value >= 0 ? '+' : ''}${Math.round(value)}%`;

  const renderInsightPreview = (insight) => {
    const isAmount = insight.type === 'net' || insight.type === 'pace';
    const showCategories = insight.type === 'categories';
    const showChart = !!insight.chart?.values?.length;
    const topItems = (insight.items || []).slice(0, 3);
    const toneColor =
      insight.tone === 'negative' ? 'danger' : insight.tone === 'positive' ? 'accent' : 'primary';

    return (
      <Card style={style.insightCard}>
        <View style={style.insightCardContent}>
          <View style={style.insightHeader}>
            <Text align="left" bold uppercase numberOfLines={2} size="xs">
              {insight.title}
            </Text>
            {insight.caption ? (
              <Text tone="secondary" numberOfLines={2} size="xs">
                {insight.caption}
              </Text>
            ) : null}
          </View>
          <View flex style={style.insightContent}>
            {isAmount ? (
              <View style={style.insightValue}>
                <PriceFriendly bold size="l" currency={baseCurrency} operator value={insight.value} />
              </View>
            ) : null}
            {insight.type === 'trend' && insight.valueLabel ? (
              <Text bold tone={toneColor} style={style.insightTrendValue} size="xl">
                {formatSignedPercent(insight.value)}
              </Text>
            ) : null}
            {insight.type === 'alert' && insight.valueLabel ? (
              <View row style={style.insightValueRow}>
                <Icon name={ICON.ALERT} tone="danger" size="xs" />
                <Text bold tone="danger" size="xl">
                  {insight.valueLabel}
                </Text>
              </View>
            ) : null}
            {insight.type === 'mover' && insight.valueLabel ? (
              <View row style={style.insightValueRow}>
                <Text bold tone={toneColor} size="xl">
                  {formatSignedPercent(insight.value)}
                </Text>
              </View>
            ) : null}
            {insight.type === 'mover' && insight.meta ? (
              <View style={style.insightMetrics}>
                <MetricBar
                  color="accent"
                  percent={(insight.meta.current / Math.max(1, insight.meta.current + insight.meta.avg)) * 100}
                  title={L10N.INSIGHT_THIS_MONTH}
                  value={
                    <PriceFriendly size="xs" tone="secondary" currency={baseCurrency} value={insight.meta.current} />
                  }
                />
                <MetricBar
                  color="content"
                  percent={(insight.meta.avg / Math.max(1, insight.meta.current + insight.meta.avg)) * 100}
                  title={L10N.INSIGHT_3MO_AVG}
                  value={<PriceFriendly size="xs" tone="secondary" currency={baseCurrency} value={insight.meta.avg} />}
                />
              </View>
            ) : null}
            {insight.type === 'net' && insight.meta ? (
              <View style={style.insightMetrics}>
                <MetricBar
                  color="accent"
                  percent={(insight.meta.incomes / Math.max(1, insight.meta.incomes + insight.meta.expenses)) * 100}
                  title={L10N.INCOME}
                  value={
                    <PriceFriendly size="xs" tone="secondary" currency={baseCurrency} value={insight.meta.incomes} />
                  }
                />
                <MetricBar
                  color="content"
                  percent={(insight.meta.expenses / Math.max(1, insight.meta.incomes + insight.meta.expenses)) * 100}
                  title={L10N.EXPENSE}
                  value={
                    <PriceFriendly size="xs" tone="secondary" currency={baseCurrency} value={insight.meta.expenses} />
                  }
                />
              </View>
            ) : null}
            {insight.type === 'pace' && insight.meta ? (
              <View style={style.insightMetrics}>
                <MetricBar
                  percent={(insight.meta.day / insight.meta.daysInMonth) * 100}
                  title={L10N.INSIGHT_MONTH_PROGRESS}
                  value={`${insight.meta.day}/${insight.meta.daysInMonth}`}
                />
              </View>
            ) : null}
            {showChart ? (
              <LineChart
                height={StyleSheet.value('$spaceM * 3.5')}
                monthsLimit={insight.chart.monthsLimit}
                values={insight.chart.values}
                style={insight.type === 'trend' ? style.insightChartTrend : style.insightChart}
                width={StyleSheet.value('$cardAccountSize')}
              />
            ) : null}
            {showCategories ? (
              <View style={style.insightCategories}>
                {topItems.map((item) => (
                  <View key={`${insight.id}-${item.category}`} style={style.insightCategoryItem}>
                    <MetricBar percent={item.share} title={item.label} value={`${Math.round(item.share)}%`} />
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        </View>
      </Card>
    );
  };

  return (
    <>
      <Summary {...overall} currency={baseCurrency} detail style={style.summary} />

      {hasInsights ? (
        <>
          <View style={style.insightsHeading}>
            <Heading value={L10N.INSIGHTS} offset />
          </View>
          <ScrollView
            horizontal
            snapTo={StyleSheet.value('$cardAccountSnap')}
            style={style.insightsScroll}
          >
            {previewInsights.map((insight, index) => (
              <View
                key={insight.id}
                style={[
                  style.card,
                  index === 0 && style.firstCard,
                  index === previewInsights.length - 1 && style.lastCard,
                ]}
              >
                {renderInsightPreview(insight)}
              </View>
            ))}
          </ScrollView>
        </>
      ) : null}

      <View style={style.accountsHeading}>
        <Heading value={L10N.ACCOUNTS} offset>
          <Button
            icon={ICON.NEW}
            variant="outlined"
            size="s"
            onPress={() => navigate('account', { create: true })}
          />
        </Heading>
      </View>

      <ScrollView horizontal snapTo={StyleSheet.value('$cardAccountSnap')} style={[style.scrollView]}>
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
          <Button
            icon={!search ? ICON.SEARCH : ICON.CLOSE}
            variant="outlined"
            size="s"
            onPress={handleSearch}
          />
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
