import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { useWindowDimensions } from 'react-native';

import { ButtonSummary } from './components';
import { query } from './modules';
import { style } from './Transactions.style';
import { Icon, Screen, ScrollView, Pressable, View } from '../../__design-system__';
import { Banner, GroupTransactions, Heading, Summary } from '../../components';
import { useStore } from '../../contexts';
import { C, ICON, L10N } from '../../modules';

const {
  TX: {
    TYPE: { INCOME, EXPENSE, TRANSFER },
  },
} = C;

const Transactions = ({ route: { params: { vault: { hash } } = {} } = {}, navigation = {} }) => {
  const scrollview = useRef(null);
  const { settings: { baseCurrency } = {}, vaults = [] } = useStore();

  const { height } = useWindowDimensions();

  const [dataSource, setDataSource] = useState({});
  const [scrollQuery, setScrollQuery] = useState(false);
  const [txs, setTxs] = useState([]);

  useEffect(() => {
    scrollview.current.scrollTo({ y: 0, animated: false });

    const vault = vaults.find((item) => item.hash === hash);
    setDataSource(vault);
    setTxs(query(vault.txs));
    setScrollQuery(false);

    navigation.setOptions({
      title: vault.title,
      headerLeft: () => (
        <Pressable onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" title />
        </Pressable>
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hash, vaults]);

  const handleEdit = () => {
    navigation.navigate('account', dataSource);
  };

  const handleScroll = (nextScroll, y) => {
    if (!scrollQuery && y > height / 2) {
      setScrollQuery(true);
      setTxs(query(dataSource.txs, true));
    }
  };

  const handleTransaction = (type) => {
    navigation.navigate('transaction', { type, vault: dataSource });
  };

  const { currency = baseCurrency, ...rest } = dataSource;

  return (
    <Screen>
      <ScrollView ref={scrollview} onScroll={handleScroll}>
        <Summary {...rest} currency={currency}>
          <View style={style.buttons}>
            <ButtonSummary icon={ICON.INCOME} text={L10N.INCOME} onPress={() => handleTransaction(INCOME)} />
            <ButtonSummary icon={ICON.EXPENSE} text={L10N.EXPENSE} onPress={() => handleTransaction(EXPENSE)} />
            {vaults.length > 1 && (
              <ButtonSummary icon={ICON.SWAP} text={L10N.SWAP} onPress={() => handleTransaction(TRANSFER)} />
            )}
            <ButtonSummary icon={ICON.SETTINGS} text={L10N.SETTINGS} onPress={handleEdit} />
          </View>
        </Summary>

        {txs.length > 0 ? (
          <>
            <Heading value={L10N.TRANSACTIONS} />
            {txs.map((item) => (
              <GroupTransactions key={item.timestamp} {...item} currency={currency} />
            ))}
          </>
        ) : (
          <Banner
            align="center"
            // ! TODO: Setup image
            // image={}
            title={L10N.NO_TRANSACTIONS}
          />
        )}
      </ScrollView>
    </Screen>
  );
};

Transactions.propTypes = {
  route: PropTypes.any,
  navigation: PropTypes.any,
};

export { Transactions };
