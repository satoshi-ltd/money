import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import { getStyles } from './TransactionsList.style';
import { useApp } from '../../contexts';
import { dailyNet, verboseDate } from '../../modules';
import { View } from '../../primitives';
import { Eyebrow } from '../Eyebrow';
import { PriceFriendly } from '../PriceFriendly';

const TransactionsHeader = React.memo(({ accounts = [], baseCurrency, data = [], rates = {}, title = new Date() }) => {
  const { colors, language } = useApp();
  const style = useMemo(() => getStyles(colors), [colors]);

  const net = useMemo(() => dailyNet(data, { accounts, baseCurrency, rates }), [accounts, data, baseCurrency, rates]);

  return (
    <View style={style.headerContainer}>
      <Eyebrow>
        {verboseDate(new Date(title), { locale: language, relative: true, day: 'numeric', month: 'short' })}
      </Eyebrow>
      {net !== 0 ? (
        <PriceFriendly
          currency={baseCurrency}
          operator
          showSymbol
          size="xs"
          tone={net > 0 ? 'positive' : 'muted'}
          value={net}
        />
      ) : null}
    </View>
  );
});

TransactionsHeader.displayName = 'TransactionsHeader';

TransactionsHeader.propTypes = {
  accounts: PropTypes.array,
  baseCurrency: PropTypes.string,
  data: PropTypes.array,
  rates: PropTypes.object,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export { TransactionsHeader };
