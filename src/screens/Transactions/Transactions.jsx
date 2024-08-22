import { Icon, Pressable, Screen, SectionList, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import { ButtonSummary } from './components';
import { query } from './modules';
import { style } from './Transactions.style';
import { Banner, GroupTransactions, GroupTransactionsItem, Heading, Summary } from '../../components';
import { useStore } from '../../contexts';
import { C, ICON, L10N } from '../../modules';

const {
  TX: {
    TYPE: { INCOME, EXPENSE, TRANSFER },
  },
} = C;

const Transactions = ({ route: { params: { account: { hash } } = {} } = {}, navigation = {} }) => {
  const { accounts = [], settings: { baseCurrency } = {} } = useStore();

  const [dataSource, setDataSource] = useState({});
  const [txs, setTxs] = useState([]);
  const [page, setPage] = useState(2);

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
  }, [hash, JSON.stringify(accounts), page]);

  const handleEdit = () => {
    navigation.navigate('account', dataSource);
  };

  const handleTransaction = (type) => {
    navigation.navigate('transaction', { account: dataSource, type });
  };

  const { currency = baseCurrency, ...rest } = dataSource;

  return (
    <Screen disableScroll style={style.container}>
      <Summary {...rest} currency={currency}>
        <View style={style.buttons}>
          <ButtonSummary icon={ICON.INCOME} text={L10N.INCOME} onPress={() => handleTransaction(INCOME)} />
          <ButtonSummary icon={ICON.EXPENSE} text={L10N.EXPENSE} onPress={() => handleTransaction(EXPENSE)} />
          {accounts.length > 1 && (
            <ButtonSummary icon={ICON.SWAP} text={L10N.SWAP} onPress={() => handleTransaction(TRANSFER)} />
          )}
          <ButtonSummary icon={ICON.SETTINGS} text={L10N.SETTINGS} onPress={handleEdit} />
        </View>
      </Summary>

      {txs.length > 0 ? (
        <>
          <Heading value={L10N.TRANSACTIONS} />
          <SectionList
            dataSource={txs}
            keyExtractor={(item) => item.timestamp}
            onEndReached={() => setPage(page + 1)}
            renderItem={({ item }) => <GroupTransactionsItem currency={baseCurrency} {...item} />}
            renderSectionHeader={({ section }) => <GroupTransactions {...section} />}
          />
        </>
      ) : (
        <Banner align="center" title={L10N.NO_TRANSACTIONS} />
      )}
    </Screen>
  );
};

Transactions.propTypes = {
  route: PropTypes.any,
  navigation: PropTypes.any,
};

export { Transactions };
