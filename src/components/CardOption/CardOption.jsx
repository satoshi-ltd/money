import { Card, Icon, Pressable, Text } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React from 'react';

import { style } from './CardOption.style';
import { CurrencyLogo } from '../CurrencyLogo';

const CardOption = ({
  caption,
  color = 'border',
  children,
  currency,
  highlight,
  icon,
  legend,
  secondary = false,
  onPress,
  ...others
}) => {
  const cardColor = highlight ? (secondary ? 'accent' : 'content') : color;
  const textColor = highlight ? (secondary ? 'content' : 'base') : undefined;

  return (
    <Pressable {...others} onPress={onPress}>
      <Card align="center" color={cardColor} small style={style.card}>
        {icon && <Icon color={textColor} name={icon} />}

        {currency && <CurrencyLogo currency={currency} highlight={highlight} />}

        {!!caption && (
          <Text align="center" bold caption color={textColor} numberOfLines={1}>
            {caption}
          </Text>
        )}

        {legend && (
          <Text align="center" color={textColor || 'contentLight'} numberOfLines={1} tiny>
            {legend}
          </Text>
        )}

        {children}
      </Card>
    </Pressable>
  );
};

CardOption.propTypes = {
  caption: PropTypes.string,
  color: PropTypes.string,
  children: PropTypes.node,
  currency: PropTypes.string,
  highlight: PropTypes.bool,
  icon: PropTypes.string,
  legend: PropTypes.string,
  secondary: PropTypes.bool,
  onPress: PropTypes.func,
};

export { CardOption };
