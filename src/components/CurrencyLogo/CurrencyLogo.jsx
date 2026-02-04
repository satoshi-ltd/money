import { Icon, Text, View } from '../../design-system';
import PropTypes from 'prop-types';
import React from 'react';

import { style } from './CurrencyLogo.style';
import { getCurrencySymbol, ICON } from '../../modules';

const CurrencyLogo = ({ currency, muted, ...others }) => {
  const symbol = getCurrencySymbol(currency);
  const showGoldIcon = currency === 'XAU' && !symbol;
  const showSilverIcon = currency === 'XAG' && !symbol;
  const color = muted ? 'contentLight' : 'content';

  return (
    <View style={[style.container, others.style]}>
      {showGoldIcon ? <Icon name={ICON.GOLD} size="xs" color={color} /> : null}
      {showSilverIcon ? <Icon name={ICON.SILVER} size="xs" color={color} /> : null}
      {symbol ? (
        <Text
          bold
          color={color}
          caption={symbol.length === 1}
          tiny={symbol.length > 1}
        >
          {symbol}
        </Text>
      ) : null}
    </View>
  );
};

CurrencyLogo.propTypes = {
  currency: PropTypes.string,
  muted: PropTypes.bool,
};

export { CurrencyLogo };
