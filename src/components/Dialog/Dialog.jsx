import { Button, Text, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React from 'react';

import { style } from './Dialog.style';
import { useStore } from '../../contexts';

const Dialog = ({ accept, cancel, text, onAccept, onCancel, title, ...others }) => {
  const { settings: { colorCurrency } = {} } = useStore();

  <View {...others} swipeable onClose={onCancel}>
    <Text bold subtitle style={style.title}>
      {title}
    </Text>
    {text && <Text color="contentLight">{text}</Text>}
    <View style={style.buttons}>
      {cancel && onCancel && <Button onPress={onCancel}>{cancel}</Button>}
      <Button secondary={!colorCurrency} onPress={onAccept}>
        {accept}
      </Button>
    </View>
  </View>;
};

Dialog.propTypes = {
  accept: PropTypes.string,
  cancel: PropTypes.string,
  text: PropTypes.string,
  title: PropTypes.string,
  onAccept: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
};

export { Dialog };
