import React, { useMemo } from 'react';

import { getStyles } from './Logo.style';
import { useApp } from '../../contexts';
import { Text, View } from '../../primitives';

const Logo = () => {
  const { colors } = useApp();
  const style = useMemo(() => getStyles(colors), [colors]);
  return (
    <View style={style.container}>
      <Text bold style={style.text}>
        môney
      </Text>
      <View style={style.dot} />
    </View>
  );
};

export { Logo };
