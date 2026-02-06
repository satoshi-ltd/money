import PropTypes from 'prop-types';
import React from 'react';

import { styles } from './CurrencyLogo.style';
import { getCurrencySymbol, ICON } from '../../modules';
import { Icon, Text, View } from '../../primitives';

const CurrencyLogo = ({ currency, muted, ...others }) => {
  const symbol = getCurrencySymbol(currency);
  const showGoldIcon = currency === 'XAU' && !symbol;
  const showSilverIcon = currency === 'XAG' && !symbol;
  const tone = muted ? 'secondary' : 'primary';
  const symbolSize = symbol && symbol.length > 1 ? 'xs' : 's';

  return (
    <View style={[styles.container, others.style]}>
      {showGoldIcon ? <Icon name={ICON.GOLD} size="xs" tone={tone} /> : null}
      {showSilverIcon ? <Icon name={ICON.SILVER} size="xs" tone={tone} /> : null}
      {symbol ? (
        <Text bold tone={tone} size={symbolSize}>
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
