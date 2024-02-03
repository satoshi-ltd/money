import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import StyleSheet from 'react-native-extended-stylesheet';

import { style } from './Dashboard.style';
import { queryAccounts, queryLastTxs, querySearchTxs } from './helpers';
import { Action, Input, Screen, ScrollView } from '../../../__design-system__';
import { CardAccount, GroupTransactions, Heading, Summary } from '../../../components';
import { useStore } from '../../../contexts';
import { getProgressionPercentage, L10N } from '../../../modules';

const Dashboard = ({ navigation: { navigate } = {} }) => {
  const { accounts = [], settings: { baseCurrency } = {}, overall = {}, txs = [] } = useStore();

  const [lastTxs, setLastTxs] = useState([]);
  const [search, setSearch] = useState(false);
  const [query, setQuery] = useState();

  useEffect(() => {
    if (!accounts.length) navigate('account', { firstAccount: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const nextTxs = queryLastTxs({ txs, accounts });
    if (JSON.stringify(nextTxs) !== JSON.stringify(lastTxs)) setLastTxs(nextTxs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txs, accounts]);

  const handleSearch = () => {
    setSearch(() => {
      setQuery(undefined);
      return !search;
    });
  };

  const sortedAccounts = queryAccounts({ query: undefined, accounts });

  return (
    <Screen>
      <Summary {...overall} currency={baseCurrency} detail />

      <Heading value={L10N.ACCOUNTS}>
        <Action caption onPress={() => navigate('account', { create: true })}>{`${L10N.NEW} ${L10N.ACCOUNT}`}</Action>
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
            <Action caption onPress={handleSearch}>
              {!search ? L10N.SEARCH : L10N.CLOSE}
            </Action>
          </Heading>
          {search && (
            <Input placeholder={`${L10N.SEARCH}...`} value={query} onChange={setQuery} style={style.inputSearch} />
          )}

          {(querySearchTxs({ L10N, query, txs, accounts }) || lastTxs).map((item) => (
            <GroupTransactions {...item} key={`${item.timestamp}`} currency={baseCurrency} />
          ))}
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
