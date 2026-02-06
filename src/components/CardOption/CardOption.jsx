import PropTypes from 'prop-types';
import React from 'react';

import { style } from './CardOption.style';
import { Icon, Pressable, Text } from '../../primitives';
import Card from '../Card';
import { CurrencyLogo } from '../CurrencyLogo';

const CardOption = ({ caption, children, currency, highlight, icon, legend, onPress, ...others }) => {
  const contentTone = highlight ? 'onAccent' : 'primary';
  const legendTone = highlight ? 'onAccent' : 'secondary';

  return (
    <Pressable {...others} onPress={onPress}>
      <Card active={highlight} style={style.card} size="s">
        {icon && <Icon tone={contentTone} name={icon} />}

        {currency && <CurrencyLogo currency={currency} highlight={highlight} />}

        {!!caption && (
          <Text align="center" bold tone={contentTone} numberOfLines={1} size="s">
            {caption}
          </Text>
        )}

        {legend && (
          <Text align="center" tone={legendTone} numberOfLines={1} size="xs">
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
