import PropTypes from 'prop-types';
import React from 'react';

import { styles as style } from './GroupTransaction.style';
import { Item } from './GroupTransactions.Item';
import { verboseDate } from '../../modules';
import { Text, View } from '../../primitives';

const GroupTransactions = ({ currency, timestamp = new Date(), txs = [] }) => (
  <View style={style.container}>
    <Text bold tone="secondary" style={style.date} size="s">
      {verboseDate(new Date(timestamp), { relative: true, day: 'numeric', month: 'long', year: 'numeric' })}
    </Text>

    {txs.map((tx, index) => (
      <Item key={`${tx.hash}-${index}`} currency={currency} {...tx} />
    ))}
  </View>
);

GroupTransactions.propTypes = {
  currency: PropTypes.string.isRequired,
  timestamp: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  txs: PropTypes.arrayOf(PropTypes.shape()).isRequired,
};

export { GroupTransactions };
