import PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';

import { ButtonSummary } from './components';
import { getStyles } from './Transactions.style';
import { Button, Heading, InputField, InsightsCarousel, View } from '../../components';
import { useApp, useStore } from '../../contexts';
import { buildInsights, getProgressionPercentage, C, ICON, L10N } from '../../modules';

const {
  TX: {
    TYPE: { INCOME, EXPENSE, TRANSFER },
  },
} = C;
let timeoutId;

const TransactionsListHeader = ({ chartBalanceBase, dataSource, navigation, onSearch, setPage }) => {
  const { accounts = [], rates = {}, settings: { baseCurrency } = {} } = useStore();
  const { colors } = useApp();
  const style = React.useMemo(() => getStyles(colors), [colors]);
  const { currency = baseCurrency, ...rest } = dataSource;

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

  const handleEdit = () => {
    navigation.navigate('account', dataSource);
  };

  const handleTransaction = (type) => {
    navigation.navigate('transaction', { account: dataSource, type });
  };

  const accountInsights = useMemo(() => {
    if (!dataSource?.hash) return [];
    return buildInsights({
      accounts: [dataSource],
      rates,
      settings: { baseCurrency: currency },
      txs: dataSource.txs || [],
    });
  }, [currency, dataSource, rates]);

  const progressionPercentage = useMemo(() => {
    const next = getProgressionPercentage(rest?.currentBalance, rest?.currentMonth?.progressionCurrency);
    return Number.isFinite(next) ? next : undefined;
  }, [rest?.currentBalance, rest?.currentMonth?.progressionCurrency]);

  const balanceCard = useMemo(
    () => ({
      title: L10N.TOTAL_BALANCE,
      value: rest?.currentBalance || 0,
      chartValues: Array.isArray(chartBalanceBase) ? chartBalanceBase.slice(-12) : [],
      progressionPercentage,
    }),
    [chartBalanceBase, progressionPercentage, rest?.currentBalance],
  );

  return (
    <>
      {dataSource?.hash ? (
        <>
          <View style={style.insightsTop}>
            <Heading value={L10N.INSIGHTS} offset />
          </View>
          <InsightsCarousel balanceCard={balanceCard} currency={currency} insights={accountInsights} />
        </>
      ) : null}

      <View style={style.headerWrap}>
        <View row style={style.buttons}>
          <ButtonSummary icon={ICON.INCOME} text={L10N.INCOME} onPress={() => handleTransaction(INCOME)} />
          <ButtonSummary icon={ICON.EXPENSE} text={L10N.EXPENSE} onPress={() => handleTransaction(EXPENSE)} />
          {accounts.length > 1 && (
            <ButtonSummary icon={ICON.SWAP} text={L10N.SWAP} onPress={() => handleTransaction(TRANSFER)} />
          )}
          <ButtonSummary icon={ICON.SETTINGS} text={L10N.SETTINGS} onPress={handleEdit} />
        </View>

        <Heading value={L10N.TRANSACTIONS}>
          <Button icon={!search ? ICON.SEARCH : ICON.CLOSE} variant="outlined" size="s" onPress={handleSearch} />
        </Heading>
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
      </View>
    </>
  );
};

TransactionsListHeader.displayName = 'TransactionsListHeader';

TransactionsListHeader.propTypes = {
  chartBalanceBase: PropTypes.any,
  dataSource: PropTypes.any,
  navigation: PropTypes.any,
  onSearch: PropTypes.func,
  setPage: PropTypes.func,
};

export { TransactionsListHeader };
