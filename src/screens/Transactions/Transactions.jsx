import { Icon, Screen, Pressable } from '@satoshi-ltd/nano-design';
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

const Transactions = ({
  route: { params: { account: { hash, chartBalanceBase = [] } } = {} } = {},
  navigation = {},
}) => {
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

    navigation.setOptions({
      title: account.title,
      headerLeft: () => (
        <Pressable
          onPress={() => navigation.goBack()}
          {...(C.IS_ANDROID ? { onPressIn: () => navigation.goBack() } : {})}
        >
          <Icon name="chevron-left" title />
        </Pressable>
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts, hash, page]);

  const { currency = baseCurrency } = dataSource;

  // ! TODO assign events to <Screen>
  return (
    <Screen disableScroll={!IS_WEB}>
      <SectionList
        initialNumToRender={C.TRANSACTIONS_PER_PAGE}
        keyExtractor={(item) => item.timestamp}
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
    </Screen>
  );
};

Transactions.propTypes = {
  route: PropTypes.any,
  navigation: PropTypes.any,
};

export { Transactions };
