import { Icon, Pressable, Text, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React from 'react';

import { style } from './ButtonSummary.style';

const ButtonSummary = ({ icon, text, onPress }) => (
  <View style={style.container}>
    <Pressable onPress={onPress} style={style.button}>
      <Icon name={icon} subtitle />
    </Pressable>
    <Text bold tiny>
      {text}
    </Text>
  </View>
);

ButtonSummary.propTypes = {
  icon: PropTypes.string,
  text: PropTypes.string,
  onPress: PropTypes.func,
};

export { ButtonSummary };
