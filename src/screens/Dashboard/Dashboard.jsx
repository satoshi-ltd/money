import { Screen } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { SectionList } from 'react-native';

import { DashboardListHeader } from './Dashboard.ListHeader';
import { style } from './Dashboard.style';
import { queryLastTxs, querySearchTxs } from './helpers';
import { TransactionItem, TransactionsHeader } from '../../components';
import { useStore } from '../../contexts';
import { C } from '../../modules';

const { IS_WEB } = C;

const Dashboard = ({ navigation: { navigate } = {} }) => {
  const { accounts = [], txs = [] } = useStore();

  const [lastTxs, setLastTxs] = useState([]);
  const [query, setQuery] = useState();
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!accounts.length) navigate('account', { firstAccount: true });
    // -- Shortcuts
    // else navigate('transactions', { account: accounts[5] });
    // setTimeout(() => {
    //   navigate('transaction', { type: 0 });
    // }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const nextTxs = queryLastTxs({ accounts, page, txs });
    if (JSON.stringify(nextTxs) !== JSON.stringify(lastTxs)) setLastTxs(nextTxs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts, page, txs]);

  return (
    <Screen disableScroll={!IS_WEB}>
      <SectionList
        style={style.screen}
        initialNumToRender={32}
        keyExtractor={(item) => item.timestamp}
        ListHeaderComponent={<DashboardListHeader navigate={navigate} onSearch={setQuery} setPage={setPage} />}
        onEndReached={() => setPage((prevPage) => prevPage + 1)}
        renderItem={({ item }) => <TransactionItem {...item} />}
        renderSectionHeader={({ section }) => <TransactionsHeader {...section} />}
        stickySectionHeadersEnabled={false}
        sections={querySearchTxs({ accounts, page, query, txs }) || lastTxs}
        // sections={lastTxs}
      />
    </Screen>
  );
};

Dashboard.displayName = 'Dashboard';

Dashboard.propTypes = {
  navigation: PropTypes.any,
};

export { Dashboard };
