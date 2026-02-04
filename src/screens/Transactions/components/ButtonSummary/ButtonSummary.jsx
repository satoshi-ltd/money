import { Icon, Pressable, Text, View } from '../../../../design-system';
import PropTypes from 'prop-types';
import React from 'react';

import { style } from './ButtonSummary.style';

const ButtonSummary = ({ icon, text, onPress }) => (
  <Pressable onPress={onPress} style={style.container}>
    <View style={style.iconWrap}>
      <Icon name={icon} />
    </View>
    <Text bold size="xs">
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
