import { Button, Text, View } from '../../design-system';
import PropTypes from 'prop-types';
import React from 'react';

import { style } from './Dialog.style';

const Dialog = ({ accept, cancel, text, onAccept, onCancel, title, ...others }) => (
  <View {...others} swipeable onClose={onCancel}>
    <Text bold style={style.title} size="xl">
      {title}
    </Text>
    {text && <Text tone="secondary">{text}</Text>}
    <View style={style.buttons}>
      {cancel && onCancel && <Button onPress={onCancel}>{cancel}</Button>}
      <Button onPress={onAccept}>{accept}</Button>
    </View>
  </View>
);

Dialog.propTypes = {
  accept: PropTypes.string,
  cancel: PropTypes.string,
  text: PropTypes.string,
  title: PropTypes.string,
  onAccept: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
};

export { Dialog };
