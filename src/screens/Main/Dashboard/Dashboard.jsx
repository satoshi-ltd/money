import { Action, Input, Screen, ScrollView, SectionList } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import StyleSheet from 'react-native-extended-stylesheet';

import { style } from './Dashboard.style';
import { queryAccounts, queryLastTxs, querySearchTxs } from './helpers';
import { CardAccount, GroupTransactions, GroupTransactionsItem, Heading, Summary } from '../../../components';
import { useStore } from '../../../contexts';
import { getProgressionPercentage, L10N } from '../../../modules';

const Dashboard = ({ navigation: { navigate } = {} }) => {
  const { accounts = [], settings: { baseCurrency } = {}, overall = {}, txs = [] } = useStore();

  const [lastTxs, setLastTxs] = useState([]);
  const [search, setSearch] = useState(false);
  const [query, setQuery] = useState();
  const [page, setPage] = useState(2);

  useEffect(() => {
    if (!accounts.length) navigate('account', { firstAccount: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const nextTxs = queryLastTxs({ accounts, page, txs });
    setLastTxs(nextTxs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(accounts), JSON.stringify(txs), page]);

  const handleSearch = () => {
    setSearch(() => {
      setQuery(undefined);
      return !search;
    });
  };

  const sortedAccounts = queryAccounts({ accounts, query: undefined });

  return (
    <Screen disableScroll style={style.container}>
      <Summary {...overall} currency={baseCurrency} detail />

      <Heading value={L10N.ACCOUNTS}>
        <Action color="content" caption onPress={() => navigate('account', { create: true })}>
          {`${L10N.NEW} ${L10N.ACCOUNT}`}
        </Action>
      </Heading>

      <ScrollView horizontal snap={StyleSheet.value('$cardAccountSnap')} style={[style.scrollView]}>
        {sortedAccounts.map((account, index) => {
          const {
            currentBalance,
            currency,
            currentMonth: { progressionCurrency },
            hash,
            title,
          } = account;

          return (
            <CardAccount
              {...account.others}
              key={hash}
              balance={currentBalance}
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

      {lastTxs.length > 0 && (
        <>
          <Heading value={L10N.LAST_TRANSACTIONS}>
            <Action caption color="content" onPress={handleSearch}>
              {!search ? L10N.SEARCH : L10N.CLOSE}
            </Action>
          </Heading>
          {search && (
            <Input
              autoFocus
              placeholder={`${L10N.SEARCH}...`}
              value={query}
              onChange={setQuery}
              style={style.inputSearch}
            />
          )}
          <SectionList
            dataSource={querySearchTxs({ accounts, query, txs, page }) || lastTxs}
            keyExtractor={(item) => item.timestamp}
            renderItem={({ item }) => <GroupTransactionsItem currency={baseCurrency} {...item} />}
            renderSectionHeader={({ section }) => <GroupTransactions {...section} />}
            onEndReached={() => setPage(page + 1)}
            style={style.sectionList}
          />
        </>
      )}
    </Screen>
  );
};

Dashboard.displayName = 'Dashboard';

Dashboard.propTypes = {
  navigation: PropTypes.any,
};

export { Dashboard };
