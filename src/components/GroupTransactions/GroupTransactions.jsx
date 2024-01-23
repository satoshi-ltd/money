import PropTypes from 'prop-types';
import React from 'react';

import { style } from './GroupTransaction.style';
import { Item } from './GroupTransactions.Item';
import { Card, Text } from '../../__design-system__';
import { C, L10N } from '../../modules';

const {
  INTERNAL_TRANSFER,
  TX: {
    TYPE: { EXPENSE },
  },
} = C;

const GroupTransactions = ({ currency, timestamp = new Date(), txs = [] }) => {
  let parseTxs = [...txs];

  parseTxs = parseTxs.filter((tx, index) => {
    const { type, category } = tx;
    const valid = !(type === EXPENSE && category === INTERNAL_TRANSFER);

    if (!valid && parseTxs[index - 1]) parseTxs[index - 1].swap = tx;

    return valid;
  });

  return (
    <>
      <Card color="content" small style={style.cardDate}>
        <Text bold color="base">
          {new Date(timestamp || null).getDate()}
        </Text>

        <Text color="base" tiny>
          {L10N.MONTHS[new Date(timestamp).getMonth()].toUpperCase().substring(0, 3)}
        </Text>
      </Card>
      {parseTxs.map((tx) => (
        <Item key={tx.hash} currency={currency} {...tx} />
      ))}
    </>
  );
};

GroupTransactions.propTypes = {
  currency: PropTypes.string.isRequired,
  timestamp: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  txs: PropTypes.arrayOf(PropTypes.shape()).isRequired,
};

export { GroupTransactions };
