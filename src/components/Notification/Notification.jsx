import PropTypes from 'prop-types';
import React from 'react';
import { SafeAreaView } from 'react-native';

import { style } from './Notification.style';
import { Icon, Pressable, Text, View } from '../../__design-system__';
import { ICON } from '../../modules';

// ! TODO: Refactor

const Notification = ({ color, isVisible, text, onClose }) => {
  const colorContent = color !== 'accent' ? 'base' : undefined;

  return (
    <View style={[style.notification, style[color], { translateY: isVisible ? '0%' : '-100%' }]}>
      <SafeAreaView style={style.safeAreaView}>
        <Icon
          color={colorContent}
          name={color === 'accent' ? ICON.SUCCESS : color === 'info' ? ICON.INFO : ICON.ALERT}
        />
        <Text bold color={colorContent} caption style={style.text}>
          {text}
        </Text>

        <Pressable onPress={onClose}>
          <Icon color={colorContent} subtitle name={ICON.CLOSE} />
        </Pressable>
      </SafeAreaView>
    </View>
  );
};

Notification.displayName = 'Notification';

Notification.propTypes = {
  color: PropTypes.oneOf(['alert', 'info', 'accent']),
  isVisible: PropTypes.bool,
  text: PropTypes.string.isRequired,
  onClose: PropTypes.func,
};

export { Notification };
