import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import { getStyles } from './ButtonSummary.style';
import { useApp } from '../../../../contexts';
import { Icon, Pressable, Text, View } from '../../../../primitives';

const ButtonSummary = ({ icon, text, onPress }) => {
  const { colors } = useApp();
  const style = useMemo(() => getStyles(colors), [colors]);

  return (
    <Pressable onPress={onPress} style={style.container}>
      <View style={style.iconWrap}>
        <Icon name={icon} />
      </View>
      <Text bold size="xs">
        {text}
      </Text>
    </Pressable>
  );
};

ButtonSummary.propTypes = {
  icon: PropTypes.string,
  text: PropTypes.string,
  onPress: PropTypes.func,
};

export { ButtonSummary };
