import { Card, Text } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React from 'react';

import { style } from './GroupTransaction.style';
import { L10N } from '../../modules';

const GroupTransactions = ({ timestamp = new Date() }) => (
  <>
    <Card color="content" small style={style.cardDate}>
      <Text bold color="base">
        {new Date(timestamp || null).getDate()}
      </Text>

      <Text color="base" tiny>
        {L10N.MONTHS[new Date(timestamp).getMonth()].toUpperCase().substring(0, 3)}
      </Text>
    </Card>
  </>
);

GroupTransactions.propTypes = {
  timestamp: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export { GroupTransactions };
