import { Text } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React from 'react';

import { style } from './GroupTransaction.style';
import { Item } from './GroupTransactions.Item';

export const verboseDate = (date = new Date(), { locale = 'en-US', ...props } = {}) => {
  const day = date.toDateString();
  const today = new Date().toDateString();
  let yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday = yesterday.toDateString();

  return day === today
    ? 'Today'
    : day === yesterday
    ? 'Yesterday'
    : date.toLocaleDateString
    ? date.toLocaleDateString(locale, props)
    : date;
};

const GroupTransactions = ({ currency, timestamp = new Date(), txs = [] }) => (
  <>
    <Text bold caption color="contentLight" secondary style={style.date}>
      {verboseDate(new Date(timestamp), { day: 'numeric', month: 'long', year: 'numeric' })}
    </Text>

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
