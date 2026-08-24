import PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';
import { SectionList } from 'react-native';

import { queryLastTxs } from './modules';
import { TransactionsListHeader } from './Transactions.ListHeader';
import { getStyles } from './Transactions.style';
import { Button, EmptyState, FloatingAdd, Panel, TransactionItem, TransactionsHeader } from '../../components';
import { useApp, useStore } from '../../contexts';
import { C, ICON, L10N } from '../../modules';

const { TX: { TYPE: { EXPENSE } } = {} } = C;

const Transactions = (props = {}) => {
  const { route = {}, navigation = {} } = props;
  const { goBack } = navigation;
  const { params: { account: routeAccount = {} } = {} } = route;
  const { hash } = routeAccount || {};
  const { accounts = [], settings: { baseCurrency } = {} } = useStore();
  const { colors } = useApp();
  const style = useMemo(() => getStyles(colors), [colors]);

  const [page, setPage] = useState(1);

  const dataSource = useMemo(() => {
    const account = accounts.find((item) => item.hash === hash);
    return account || routeAccount || {};
  }, [accounts, hash, routeAccount]);

  const sections = useMemo(() => {
    if (!dataSource?.hash) return [];

    return queryLastTxs(dataSource.txs, page);
  }, [dataSource, page]);

  const { currency = baseCurrency } = dataSource;
  const title = dataSource?.title || L10N.TRANSACTIONS;

  return (
    <Panel
      title={title}
      onBack={goBack}
      rightElement={
        dataSource?.hash ? (
          <Button size="s" variant="outlined" onPress={() => navigation.navigate('account', dataSource)}>
            {L10N.EDIT}
          </Button>
        ) : undefined
      }
      disableScroll
      floatingElement={
        <FloatingAdd onPress={() => navigation.navigate('transaction', { account: dataSource, type: EXPENSE })} />
      }
    >
      <SectionList
        initialNumToRender={C.TRANSACTIONS_PER_PAGE}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        keyExtractor={(item, index) => `${item.hash || item.timestamp}-${index}`}
        ListEmptyComponent={
          <EmptyState
            action={L10N.EMPTY_TRANSACTIONS_ACTION}
            caption={L10N.EMPTY_TRANSACTIONS_CAPTION}
            icon={ICON.RECEIPT}
            title={L10N.EMPTY_TRANSACTIONS}
            variant="outlined"
            onAction={() => navigation.navigate('transaction', { account: dataSource, type: EXPENSE })}
          />
        }
        ListHeaderComponent={
          <TransactionsListHeader dataSource={dataSource} />
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
