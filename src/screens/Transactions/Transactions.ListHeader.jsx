import { Action, Input, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useWindowDimensions } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

import { ButtonSummary } from './components';
import { style } from './Transactions.style';
import { Heading, LineChart, Summary } from '../../components';
import { useStore } from '../../contexts';
import { C, ICON, L10N } from '../../modules';

const {
  TX: {
    TYPE: { INCOME, EXPENSE, TRANSFER },
  },
} = C;
let timeoutId;

const TransactionsListHeader = ({ chartBalanceBase, dataSource, navigation, onSearch, setPage }) => {
  const { accounts = [], settings: { baseCurrency } = {} } = useStore();
  const { currency = baseCurrency, ...rest } = dataSource;

  const { width } = useWindowDimensions();

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

  const handleEdit = () => {
    navigation.navigate('account', dataSource);
  };

  const handleTransaction = (type) => {
    navigation.navigate('transaction', { account: dataSource, type });
  };

  return (
    <>
      <Summary {...rest} currency={currency} title={rest?.title}>
        <LineChart
          currency={currency}
          height={128}
          showPointer
          values={chartBalanceBase}
          width={width - StyleSheet.value('$viewOffset') * 2}
        />

        <View row style={style.buttons}>
          <ButtonSummary icon={ICON.INCOME} text={L10N.INCOME} onPress={() => handleTransaction(INCOME)} />
          <ButtonSummary icon={ICON.EXPENSE} text={L10N.EXPENSE} onPress={() => handleTransaction(EXPENSE)} />
          {accounts.length > 1 && (
            <ButtonSummary icon={ICON.SWAP} text={L10N.SWAP} onPress={() => handleTransaction(TRANSFER)} />
          )}
          <ButtonSummary icon={ICON.SETTINGS} text={L10N.SETTINGS} onPress={handleEdit} />
        </View>
      </Summary>

      <Heading value={L10N.TRANSACTIONS}>
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

TransactionsListHeader.displayName = 'TransactionsListHeader';

TransactionsListHeader.propTypes = {
  chartBalanceBase: PropTypes.any,
  dataSource: PropTypes.any,
  navigation: PropTypes.any,
  onSearch: PropTypes.func,
  setPage: PropTypes.func,
};

export { TransactionsListHeader };
