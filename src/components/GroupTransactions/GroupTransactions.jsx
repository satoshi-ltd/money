import PropTypes from 'prop-types';
import React from 'react';

import { style } from './GroupTransaction.style';
import { Item } from './GroupTransactions.Item';
import { Card, Text } from '../../__design-system__';
import { L10N } from '../../modules';

const GroupTransactions = ({ currency, timestamp = new Date(), txs = [] }) => (
  <>
    <Card color="content" small style={style.cardDate}>
      <Text bold color="base">
        {new Date(timestamp || null).getDate()}
      </Text>

      <Text color="base" tiny>
        {L10N.MONTHS[new Date(timestamp).getMonth()].toUpperCase().substring(0, 3)}
      </Text>
    </Card>
    {txs.map((tx) => (
      <Item key={tx.hash} currency={currency} {...tx} />
    ))}
  </>
);

GroupTransactions.propTypes = {
  currency: PropTypes.string.isRequired,
  timestamp: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  txs: PropTypes.arrayOf(PropTypes.shape()).isRequired,
};

export { GroupTransactions };
