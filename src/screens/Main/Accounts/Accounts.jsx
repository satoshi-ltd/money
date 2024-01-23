import PropTypes from 'prop-types';
import React, { useState } from 'react';
import StyleSheet from 'react-native-extended-stylesheet';

import { style } from './Accounts.style';
import { filter, query } from './modules';
import { Card, Pressable, Screen, ScrollView, Text, View } from '../../../__design-system__';
import { CardAccount, Heading, PriceFriendly } from '../../../components';
import { useStore } from '../../../contexts';
import { getCurrencySymbol, L10N } from '../../../modules';

const Accounts = ({ navigation: { navigate } = {} }) => {
  const {
    overall = {},
    settings: { baseCurrency },
    vaults = [],
  } = useStore();

  const [selected, setSelected] = useState();

  const currencies = query(vaults);

  return (
    <Screen>
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
            secondary
            showExchange
            title={L10N.CURRENCY_NAME[currency] || currency}
            style={[style.card, index === 0 && style.firstCard, index === currencies.length - 1 && style.lastCard]}
            onPress={() => setSelected(currency !== selected ? currency : undefined)}
          />
        ))}
      </ScrollView>

      <Heading value={L10N.ACCOUNTS} />
      <View>
        {filter(vaults, selected).map((vault) => {
          const { currency, currentBalance = 0, title } = vault;
          const hasBalance =
            currentBalance !== undefined && currentBalance !== null && parseFloat(currentBalance.toFixed(2)) > 0;

          const isBaseCurrency = currency === baseCurrency;

          return (
            <Pressable key={vault.hash} onPress={() => navigate('transactions', { vault })}>
              <View row style={[style.item, !hasBalance && style.itemDisabled]}>
                <Card align="center" color={isBaseCurrency ? 'accent' : undefined} small style={style.cardCurrency}>
                  <Text bold _color={hasBalance ? (isBaseCurrency ? 'accent' : undefined) : 'contentLight'}>
                    {getCurrencySymbol(currency)}
                  </Text>
                </Card>

                <View>
                  <Text bold numberOfLines={1}>
                    {title}
                  </Text>
                  <PriceFriendly color="contentLight" currency={currency} caption value={currentBalance} />
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
