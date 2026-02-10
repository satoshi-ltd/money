import PropTypes from 'prop-types';
import React, { useState } from 'react';

import { style } from './Accounts.style';
import { filter, query } from './modules';
import {
  Card,
  CardAccount,
  CurrencyLogo,
  Heading,
  Pressable,
  PriceFriendly,
  Screen,
  ScrollView,
  Text,
  View,
} from '../../components';
import { useStore } from '../../contexts';
import { L10N } from '../../modules';
import { cardAccountSnap } from '../../theme/layout';

const Accounts = ({ navigation: { navigate } = {} }) => {
  const { accounts = [], overall = {} } = useStore();

  const [selected, setSelected] = useState();

  const currencies = query(accounts);

  return (
    <Screen style={style.screen}>
      <Heading value={L10N.CURRENCIES} offset />
      <ScrollView horizontal snapTo={cardAccountSnap} style={style.scrollView}>
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

      <Heading value={L10N.ACCOUNTS} offset />
      <>
        {filter(accounts, selected).map((account) => {
          const { currency, currentBalance = 0, title } = account;
          const hasBalance =
            currentBalance !== undefined && currentBalance !== null && parseFloat(currentBalance.toFixed(2)) > 0;

          const tone = !hasBalance ? 'secondary' : 'primary';

          return (
            <Pressable key={account.hash} onPress={() => navigate('transactions', { account })}>
              <View row style={style.item}>
                <Card style={style.iconSpacing} size="s">
                  <CurrencyLogo currency={currency} muted={!hasBalance || currentBalance < 0} />
                </Card>

                <View flex>
                  <View gap row spaceBetween>
                    <Text bold tone={tone} numberOfLines={1} style={style.text}>
                      {title}
                    </Text>
                    <PriceFriendly bold tone={tone} currency={currency} size="s" value={currentBalance} />
                  </View>

                  <View gap row spaceBetween>
                    <Text tone="secondary" style={style.text} size="xs">
                      {L10N.CURRENCY_NAME[currency] || currency}
                    </Text>
                  </View>
                </View>
              </View>
            </Pressable>
          );
        })}
      </>
    </Screen>
  );
};

Accounts.displayName = 'Accounts';

Accounts.propTypes = {
  navigation: PropTypes.any,
};

export { Accounts };
