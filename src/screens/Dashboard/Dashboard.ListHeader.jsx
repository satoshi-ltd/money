import { Action, Input, ScrollView } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import StyleSheet from 'react-native-extended-stylesheet';

import { style } from './Dashboard.style';
import { queryAccounts } from './helpers';
import { CardAccount, Heading, Summary } from '../../components';
import { useStore } from '../../contexts';
import { getProgressionPercentage, L10N } from '../../modules';

let timeoutId;

const DashboardListHeader = ({ navigate, onSearch, setPage }) => {
  const { accounts = [], settings: { baseCurrency } = {}, overall = {} } = useStore();

  const [search, setSearch] = useState(false);
  const [query, setQuery] = useState();

  const handleSearch = () => {
    setSearch(() => {
      setPage(1);
      onSearch();
      return !search;
    });
  };

  const onQueryChange = (value) => {
    setQuery(value);
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      onSearch(value);
    }, 350);
  };

  const sortedAccounts = queryAccounts({ accounts, query: undefined });

  return (
    <>
      <Summary {...overall} currency={baseCurrency} detail />

      <Heading value={L10N.ACCOUNTS}>
        <Action color="content" caption onPress={() => navigate('account', { create: true })}>
          {`${L10N.NEW} ${L10N.ACCOUNT}`}
        </Action>
      </Heading>

      <ScrollView horizontal snap={StyleSheet.value('$cardAccountSnap')} style={[style.scrollView]}>
        {sortedAccounts.map((account, index) => {
          const {
            chartBalanceBase = [],
            currentBalance,
            currency,
            currentMonth: { progressionCurrency },
            hash,
            title,
          } = account;

          return (
            <CardAccount
              key={hash}
              balance={currentBalance}
              chart={chartBalanceBase}
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
          onChange={onQueryChange}
          style={style.inputSearch}
        />
      )}
    </>
  );
};

DashboardListHeader.displayName = 'DashboardListHeader';

DashboardListHeader.propTypes = {
  navigate: PropTypes.any,
  onSearch: PropTypes.func,
  setPage: PropTypes.func,
};

export { DashboardListHeader };
