import PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';
import { SectionList } from 'react-native';

import { queryLastTxs, querySearchTxs } from './modules';
import { TransactionsListHeader } from './Transactions.ListHeader';
import { getStyles } from './Transactions.style';
import { Panel } from '../../components';
import { Banner, TransactionItem, TransactionsHeader } from '../../components';
import { useApp, useStore } from '../../contexts';
import { C, L10N } from '../../modules';

const Transactions = (props = {}) => {
  const { route = {}, navigation = {} } = props;
  const { goBack } = navigation;
  const { params: { account: routeAccount = {} } = {} } = route;
  const { hash, chartBalanceBase: routeChartBalanceBase = [] } = routeAccount || {};
  const { accounts = [], settings: { baseCurrency } = {} } = useStore();
  const { colors } = useApp();
  const style = useMemo(() => getStyles(colors), [colors]);

  const [query, setQuery] = useState();
  const [page, setPage] = useState(1);

  const dataSource = useMemo(() => {
    const account = accounts.find((item) => item.hash === hash);
    return account || routeAccount || {};
  }, [accounts, hash, routeAccount]);

  const sections = useMemo(() => {
    if (!dataSource?.hash) return [];

    const search = querySearchTxs({ account: dataSource, page, query });
    if (search) return search;

    return queryLastTxs(dataSource.txs, page);
  }, [dataSource, page, query]);

  const { currency = baseCurrency } = dataSource;
  const title = dataSource?.title || L10N.TRANSACTIONS;
  const chartBalanceBase = dataSource?.chartBalanceBase || routeChartBalanceBase;

  return (
    <Panel title={title} onBack={goBack} disableScroll>
      <SectionList
        initialNumToRender={C.TRANSACTIONS_PER_PAGE}
        keyExtractor={(item, index) => `${item.hash || item.timestamp}-${index}`}
        ListEmptyComponent={() => <Banner align="center" title={L10N.NO_TRANSACTIONS} />}
        ListHeaderComponent={
          <TransactionsListHeader
            chartBalanceBase={chartBalanceBase}
            dataSource={dataSource}
            navigation={navigation}
            onSearch={setQuery}
            setPage={setPage}
          />
        }
        renderItem={({ item }) => <TransactionItem {...item} currency={currency} />}
        renderSectionHeader={({ section }) => <TransactionsHeader {...section} />}
        sections={sections}
        stickySectionHeadersEnabled={false}
        onEndReached={() => setPage((prevPage) => prevPage + 1)}
        style={style.screen}
      />
    </Panel>
  );
};

Transactions.propTypes = {
  route: PropTypes.any,
  navigation: PropTypes.any,
};

export { Transactions };
