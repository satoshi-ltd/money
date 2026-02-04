import Card from '../Card';
import { Icon, Pressable, Text } from '../../primitives';
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
      <Card active={highlight} style={style.card} size="s">
        {icon && <Icon color={textColor} name={icon} />}

        {currency && <CurrencyLogo currency={currency} highlight={highlight} />}

        {!!caption && (
          <Text align="center" bold color={textColor} numberOfLines={1} size="s">
            {caption}
          </Text>
        )}

        {legend && (
          <Text align="center" color={textColor || 'contentLight'} numberOfLines={1} size="xs">
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
