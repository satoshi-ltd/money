import { useRoute } from '@react-navigation/native';
import { Text, View } from '@satoshi-ltd/nano-design';
import React from 'react';

import { style } from './Logo.style';
import { useStore } from '../../contexts';
import { C } from '../../modules';

const Logo = () => {
  const { name, params: { account: { currency } = {} } = {} } = useRoute();
  const { settings: { colorCurrency = false } = {} } = useStore();

  const color = colorCurrency && name === 'transactions' && currency ? C.COLOR[currency] : undefined;

  return (
    <View style={style.container}>
      <Text bold style={style.text}>
        môney
      </Text>
      <View style={[style.color, color && { backgroundColor: color }]} />
    </View>
  );
};

export { Logo };
