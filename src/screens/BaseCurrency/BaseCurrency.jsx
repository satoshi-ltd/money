import { Card, CurrencyLogo, Icon, Panel, Pressable, Text, View } from '../../components';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import { style } from './BaseCurrency.style';
import { useStore } from '../../contexts';
import { C, eventEmitter, L10N } from '../../modules';
import { ServiceRates } from '../../services';

const { EVENT } = C;

const BaseCurrency = ({ navigation: { goBack } = {} }) => {
  const store = useStore();
  const { settings: { baseCurrency } = {}, updateRates } = store;
  const [currency, setCurrency] = useState();

  useEffect(() => {
    setCurrency(baseCurrency);
  }, [baseCurrency]);

  const handleSelect = async (nextCurrency) => {
    if (!nextCurrency || nextCurrency === baseCurrency) {
      setCurrency(nextCurrency);
      goBack();
      return;
    }

    setCurrency(nextCurrency);
    const rates = await ServiceRates.get({ baseCurrency: nextCurrency, latest: false }).catch(() =>
      eventEmitter.emit(EVENT.NOTIFICATION, { error: true, title: L10N.ERROR_SERVICE_RATES }),
    );
    if (rates) await updateRates({ ...rates, currency: nextCurrency });
    goBack();
  };

  const currencies = Object.keys(C.SYMBOL);

  return (
    <Panel offset title={L10N.CHOOSE_CURRENCY} onBack={goBack}>
      <View style={style.list}>
        {currencies.map((item) => {
          const title = L10N.CURRENCY_NAME[item] || item;

          return (
            <Pressable key={item} onPress={() => handleSelect(item)}>
              <View row style={style.item}>
                <Card style={style.iconCard} size="s">
                  <CurrencyLogo currency={item} />
                </Card>

                <View flex>
                  <Text bold={currency === item} numberOfLines={1}>
                    {title}
                  </Text>
                </View>

                {currency === item ? <Icon name="check" tone="accent" /> : <View style={style.rightPlaceholder} />}
              </View>
            </Pressable>
          );
        })}
      </View>
    </Panel>
  );
};

BaseCurrency.propTypes = {
  route: PropTypes.any,
  navigation: PropTypes.any,
};

export { BaseCurrency };
