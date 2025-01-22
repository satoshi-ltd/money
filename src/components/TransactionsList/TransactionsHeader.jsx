import { Text } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React from 'react';

import { style } from './TransactionsList.style';

const verboseDate = (date = new Date(), { locale = 'en-US', ...props } = {}) => {
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

const TransactionsHeader = ({ title = new Date() }) => (
  <Text bold caption color="contentLight" secondary style={style.date}>
    {verboseDate(new Date(title), { day: 'numeric', month: 'long', year: 'numeric' })}
  </Text>
);

TransactionsHeader.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export { TransactionsHeader };
