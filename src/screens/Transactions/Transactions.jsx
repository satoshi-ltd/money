import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useState } from 'react';
import { SectionList } from 'react-native';

import { queryLastTxs } from './modules';
import { TransactionsListHeader } from './Transactions.ListHeader';
import { getStyles } from './Transactions.style';
import { Button, EmptyState, FloatingAdd, Panel, TransactionItem, TransactionsHeader } from '../../components';
import { useApp, useStore } from '../../contexts';
import { C, categoryMonthTxs, ICON, L10N } from '../../modules';

const { TX: { TYPE: { EXPENSE } } = {} } = C;
const EMPTY = {};
const keyExtractor = (item, index) => `${item.hash || item.timestamp}-${index}`;

const Transactions = (props = {}) => {
  const { route = {}, navigation = {} } = props;
  const { goBack } = navigation;
  const { params: { account: routeAccount = EMPTY, category, month, type, year } = {} } = route;
  const { hash } = routeAccount || {};
  const byCategory = category !== undefined;
  const { accounts = [], deleteTx, rates = {}, settings: { baseCurrency } = {}, txs = [] } = useStore();
  const { colors } = useApp();
  const style = useMemo(() => getStyles(colors), [colors]);

  const [page, setPage] = useState(1);

  const dataSource = useMemo(() => {
    const account = accounts.find((item) => item.hash === hash);
    return account || routeAccount || EMPTY;
  }, [accounts, hash, routeAccount]);

  const sections = useMemo(() => {
    if (byCategory) return queryLastTxs(categoryMonthTxs(txs, { category, month, type, year }), page);
    if (!dataSource?.hash) return [];

    return queryLastTxs(dataSource.txs, page);
  }, [byCategory, category, dataSource, month, page, txs, type, year]);

  const currencyByHash = useMemo(() => new Map(accounts.map((item) => [item.hash, item.currency])), [accounts]);
  const { currency = baseCurrency } = dataSource;
  const title = byCategory
    ? `${L10N.CATEGORIES[type]?.[category] || L10N.OTHERS} · ${L10N.MONTHS[month]}`
    : dataSource?.title || L10N.TRANSACTIONS;
  const handleEndReached = useCallback(() => setPage((prevPage) => prevPage + 1), []);
  const renderItem = useCallback(
    ({ item }) => (
      <TransactionItem
        {...item}
        baseCurrency={baseCurrency}
        currency={byCategory ? currencyByHash.get(item.account) || baseCurrency : currency}
        deleteTx={deleteTx}
        rates={rates}
      />
    ),
    [baseCurrency, byCategory, currency, currencyByHash, deleteTx, rates],
  );
  const renderSectionHeader = useCallback(
    ({ section }) => (
      <TransactionsHeader {...section} accounts={accounts} baseCurrency={baseCurrency} rates={rates} />
    ),
    [accounts, baseCurrency, rates],
  );

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
        <FloatingAdd
          onPress={() =>
            navigation.navigate('transaction', byCategory ? { type } : { account: dataSource, type: EXPENSE })
          }
        />
      }
    >
      <SectionList
        initialNumToRender={C.TRANSACTIONS_PER_PAGE}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        keyExtractor={keyExtractor}
        ListEmptyComponent={
          <EmptyState
            action={L10N.EMPTY_TRANSACTIONS_ACTION}
            caption={L10N.EMPTY_TRANSACTIONS_CAPTION}
            icon={ICON.RECEIPT}
            title={L10N.EMPTY_TRANSACTIONS}
            variant="outlined"
            onAction={() =>
              navigation.navigate('transaction', byCategory ? { type } : { account: dataSource, type: EXPENSE })
            }
          />
        }
        ListHeaderComponent={
          <TransactionsListHeader dataSource={dataSource} />
        }
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        sections={sections}
        stickySectionHeadersEnabled={false}
        onEndReached={handleEndReached}
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
