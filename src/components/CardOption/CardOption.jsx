import Card from '../Card';
import { Icon, Pressable, Text } from '../../design-system';
import PropTypes from 'prop-types';
import React from 'react';

import { style } from './CardOption.style';
import { useApp } from '../../contexts';
import { CurrencyLogo } from '../CurrencyLogo';

const CardOption = ({
  caption,
  children,
  currency,
  highlight,
  icon,
  legend,
  onPress,
  ...others
}) => {
  const { colors, theme } = useApp();
  const textColor = highlight ? (theme === 'dark' ? colors.background : 'content') : undefined;

  return (
    <Pressable {...others} onPress={onPress}>
      <Card active={highlight} small style={style.card}>
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
  children: PropTypes.node,
  currency: PropTypes.string,
  highlight: PropTypes.bool,
  icon: PropTypes.string,
  legend: PropTypes.string,
  onPress: PropTypes.func,
};

export { CardOption };
