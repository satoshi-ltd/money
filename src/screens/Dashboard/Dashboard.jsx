import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SectionList } from 'react-native';
import { useScrollToTop } from '@react-navigation/native';

import { DashboardListHeader } from './Dashboard.ListHeader';
import { style } from './Dashboard.style';
import { queryLastTxs, querySearchTxs } from './helpers';
import { Masthead, Screen, TransactionItem, TransactionsHeader } from '../../components';
import { useStore } from '../../contexts';
import { C, ledgerDate } from '../../modules';

const Dashboard = ({ navigation: { navigate } = {} }) => {
  const { accounts = [], session: { locale } = {}, today, txs = [] } = useStore();
  const listRef = useRef(null);
  const initialOffsetSetRef = useRef(false);
  useScrollToTop(listRef);

  const [query, setQuery] = useState();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(false);

  const lastTxs = useMemo(() => queryLastTxs({ accounts, page, txs }), [accounts, page, txs]);
  const sections = useMemo(
    () => querySearchTxs({ accounts, page, query, txs }) || lastTxs,
    [accounts, lastTxs, page, query, txs],
  );

  const handleSearch = () => {
    setPage(1);
    setQuery(undefined);
    setSearch((previous) => !previous);
  };

  const handleQuery = (value) => {
    setPage(1);
    setQuery(value);
  };

  useEffect(() => {
    if (!accounts.length) navigate('account', { firstAccount: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInitialContentSizeChange = useCallback(() => {
    if (initialOffsetSetRef.current || !sections.length) return;

    initialOffsetSetRef.current = true;
    listRef.current?.getScrollResponder?.()?.scrollTo?.({ y: 0, animated: false });
  }, [sections.length]);

  return (
    <Screen disableScroll>
      <Masthead
        query={query}
        searching={search}
        section={ledgerDate(new Date(today || Date.now()), locale)}
        onQueryChange={handleQuery}
        onSearch={handleSearch}
      />

      <SectionList
        ref={listRef}
        initialNumToRender={C.TRANSACTIONS_PER_PAGE}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        keyExtractor={(item, index) => `${item.hash || item.timestamp}-${index}`}
        ListHeaderComponent={search ? null : <DashboardListHeader navigate={navigate} />}
        onContentSizeChange={handleInitialContentSizeChange}
        renderItem={({ item }) => <TransactionItem {...item} />}
        renderSectionHeader={({ section }) => <TransactionsHeader {...section} />}
        sections={sections}
        stickySectionHeadersEnabled={false}
        onEndReached={() => setPage((prevPage) => prevPage + 1)}
        style={style.screen}
      />
    </Screen>
  );
};

Dashboard.displayName = 'Dashboard';

Dashboard.propTypes = {
  navigation: PropTypes.any,
};

export { Dashboard };
