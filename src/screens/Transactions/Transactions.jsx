import { Icon, Screen, Pressable, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { SectionList, useWindowDimensions } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

import { ButtonSummary } from './components';
import { query } from './modules';
import { style } from './Transactions.style';
import { Banner, Heading, LineChart, Summary, TransactionItem, TransactionsHeader } from '../../components';
import { useStore } from '../../contexts';
import { C, ICON, L10N } from '../../modules';

const {
  TX: {
    TYPE: { INCOME, EXPENSE, TRANSFER },
  },
} = C;

const Transactions = ({
  route: { params: { account: { hash, chartBalanceBase = [] } } = {} } = {},
  navigation = {},
}) => {
  const { accounts = [], settings: { baseCurrency } = {} } = useStore();

  const { width } = useWindowDimensions();

  const [dataSource, setDataSource] = useState({});
  const [page, setPage] = useState(1);
  const [txs, setTxs] = useState([]);

  useEffect(() => {
    const account = accounts.find((item) => item.hash === hash);
    if (!account) return;

    setDataSource(account);
    setTxs(query(account.txs, page));

    navigation.setOptions({
      title: account.title,
      headerLeft: () => (
        <Pressable onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" title />
        </Pressable>
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts, hash, page]);

  const handleEdit = () => {
    navigation.navigate('account', dataSource);
  };

  const handleTransaction = (type) => {
    navigation.navigate('transaction', { account: dataSource, type });
  };

  const account = accounts.find((item) => item.hash === hash);
  const { currency = baseCurrency, ...rest } = dataSource;
  // ! TODO assign events to <Screen>
  return (
    <Screen disableScroll>
      <SectionList
        style={style.screen}
        initialNumToRender={20}
        keyExtractor={(item) => item.timestamp}
        ListEmptyComponent={() => (
          <Banner
            align="center"
            // ! TODO: Setup image
            // image={}
            title={L10N.NO_TRANSACTIONS}
          />
        )}
        ListHeaderComponent={() => (
          <>
            <Summary {...rest} currency={currency} title={account?.title}>
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
            <Heading value={L10N.TRANSACTIONS} />
          </>
        )}
        onEndReached={() => setPage((prevPage) => prevPage + 1)}
        renderItem={({ item }) => <TransactionItem {...item} currency={currency} />}
        renderSectionHeader={({ section }) => <TransactionsHeader {...section} />}
        stickySectionHeadersEnabled={false}
        sections={txs}
      />
    </Screen>
  );
};

Transactions.propTypes = {
  route: PropTypes.any,
  navigation: PropTypes.any,
};

export { Transactions };
