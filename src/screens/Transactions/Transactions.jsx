import { Panel } from '../../components';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { SectionList } from 'react-native';

import { queryLastTxs, querySearchTxs } from './modules';
import { TransactionsListHeader } from './Transactions.ListHeader';
import { style } from './Transactions.style';
import { Banner, TransactionItem, TransactionsHeader } from '../../components';
import { useStore } from '../../contexts';
import { C, L10N } from '../../modules';

const { IS_WEB } = C;

const Transactions = (props = {}) => {
  const { route = {}, navigation = {} } = props;
  const { goBack } = navigation;
  const { params: { account: { hash, chartBalanceBase = [] } = {} } = {} } = route;
  const { accounts = [], settings: { baseCurrency } = {} } = useStore();

  const [dataSource, setDataSource] = useState({});
  const [query, setQuery] = useState();
  const [page, setPage] = useState(1);
  const [txs, setTxs] = useState([]);

  useEffect(() => {
    const account = accounts.find((item) => item.hash === hash);
    if (!account) return;

    setDataSource(account);
    setTxs(queryLastTxs(account.txs, page));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts, hash, page]);

  const { currency = baseCurrency } = dataSource;

  return (
    <Panel title={L10N.TRANSACTIONS} onBack={goBack} disableScroll>
      <SectionList
        initialNumToRender={C.TRANSACTIONS_PER_PAGE}
        keyExtractor={(item, index) => item.hash || `${item.timestamp}-${index}`}
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
        sections={querySearchTxs({ account: dataSource, page, query }) || txs}
        stickySectionHeadersEnabled={false}
        onEndReached={!IS_WEB ? () => setPage((prevPage) => prevPage + 1) : undefined}
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
