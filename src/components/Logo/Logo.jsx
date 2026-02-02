import { Text, View } from '../../design-system';
import React from 'react';

import { style } from './Logo.style';

const Logo = () => {
  return (
    <View style={style.container}>
      <Text bold style={style.text}>
        môney
      </Text>
      <View style={style.color} />
    </View>
  );
};

export { Logo };
