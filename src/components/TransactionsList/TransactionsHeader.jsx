import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import { getStyles } from './TransactionsList.style';
import { useApp } from '../../contexts';
import { verboseDate } from '../../modules';
import { Text, View } from '../../primitives';

const TransactionsHeader = ({ title = new Date() }) => {
  const { colors } = useApp();
  const style = useMemo(() => getStyles(colors), [colors]);

  return (
    <View style={style.headerContainer}>
      <Text bold tone="secondary" style={style.date} size="s">
        {verboseDate(new Date(title), { relative: true, day: 'numeric', month: 'long', year: 'numeric' })}
      </Text>
    </View>
  );
};

TransactionsHeader.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export { TransactionsHeader };
