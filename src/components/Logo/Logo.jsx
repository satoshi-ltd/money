import React from 'react';
import { Image } from 'react-native';

import { style } from './Logo.style';
import { useStore } from '../../contexts';

const LOGO = {
  dark: require('../../../assets/images/logo-dark.png'),
  light: require('../../../assets/images/logo-light.png'),
};

const Logo = () => {
  const { settings: { theme = 'light' } = {} } = useStore();

  return <Image resizeMode="contain" source={LOGO[theme]} style={style.image} />;
};

export { Logo };
