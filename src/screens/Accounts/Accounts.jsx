import { Card, Pressable, Screen, ScrollView, Text, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import StyleSheet from 'react-native-extended-stylesheet';

import { style } from './Accounts.style';
import { filter, query } from './modules';
import { CardAccount, Heading, PriceFriendly } from '../../components';
import { useStore } from '../../contexts';
import { getCurrencySymbol, L10N } from '../../modules';

const Accounts = ({ navigation: { navigate } = {} }) => {
  const { accounts = [], overall = {} } = useStore();

  const [selected, setSelected] = useState();

  const currencies = query(accounts);

  return (
    <Screen style={style.screen}>
      <Heading value={L10N.CURRENCIES} />
      <ScrollView horizontal snap={StyleSheet.value('$cardAccountSnap')} style={style.scrollView}>
        {currencies.map(({ base, currency, ...item }, index) => (
          <CardAccount
            {...item}
            key={currency}
            currency={currency}
            highlight={currency === selected}
            operator={false}
            percentage={(base * 100) / overall.currentBalance}
            showExchange
            title={L10N.CURRENCY_NAME[currency] || currency}
            style={[style.card, index === 0 && style.firstCard, index === currencies.length - 1 && style.lastCard]}
            onPress={() => setSelected(currency !== selected ? currency : undefined)}
          />
        ))}
      </ScrollView>

      <Heading value={L10N.ACCOUNTS} />
      <View>
        {filter(accounts, selected).map((account) => {
          const { currency, currentBalance = 0, title } = account;
          const hasBalance =
            currentBalance !== undefined && currentBalance !== null && parseFloat(currentBalance.toFixed(2)) > 0;

          return (
            <Pressable key={account.hash} onPress={() => navigate('transactions', { account })}>
              <View row style={style.item}>
                <Card align="center" small outlined={!hasBalance} style={style.cardCurrency}>
                  <Text bold>{getCurrencySymbol(currency)}</Text>
                </Card>

                <View>
                  <Text bold numberOfLines={1}>
                    {title}
                  </Text>
                  <PriceFriendly bold color="contentLight" currency={currency} caption value={currentBalance} />
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
};

Accounts.displayName = 'Accounts';

Accounts.propTypes = {
  navigation: PropTypes.any,
};

export { Accounts };
