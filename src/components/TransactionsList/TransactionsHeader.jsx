import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import { getStyles } from './TransactionsList.style';
import { useApp } from '../../contexts';
import { L10N } from '../../modules';
import { Text, View } from '../../primitives';

// ! TODO: Refacto
const verboseDate = (date = new Date(), { locale = 'en-US', ...props } = {}) => {
  const day = date.toDateString();
  const today = new Date().toDateString();
  let yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday = yesterday.toDateString();

  return day === today
    ? L10N.TODAY
    : day === yesterday
    ? L10N.YESTERDAY
    : date.toLocaleDateString
    ? date.toLocaleDateString(locale, props)
    : date;
};

const TransactionsHeader = ({ title = new Date() }) => {
  const { colors } = useApp();
  const style = useMemo(() => getStyles(colors), [colors]);

  return (
    <View style={style.headerContainer}>
      <Text bold tone="secondary" style={style.date} size="s">
        {verboseDate(new Date(title), { day: 'numeric', month: 'long', year: 'numeric' })}
      </Text>
    </View>
  );
};

TransactionsHeader.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export { TransactionsHeader };
