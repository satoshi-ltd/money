import { Icon, Pressable, Text, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React from 'react';

import { style } from './ButtonSummary.style';

const ButtonSummary = ({ icon, text, onPress }) => (
  <Pressable onPress={onPress} style={style.container}>
    <Icon name={icon} />
    <Text bold tiny>
      {text}
    </Text>
  </Pressable>
);

ButtonSummary.propTypes = {
  icon: PropTypes.string,
  text: PropTypes.string,
  onPress: PropTypes.func,
};

export { ButtonSummary };
