import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Keyboard, TextInput } from 'react-native';

import { style } from './Input.style';
import { Text, View } from '../../__design-system__';

const Input = ({ keyboard = 'default', label, value = '', onChange, ...others }) => {
  const [focus, setFocus] = useState(false);

  const handleChange = (next = '') => {
    onChange && onChange(next.toString().length > 0 ? next : undefined);
  };

  return (
    <View style={[style.container, focus && style.focus, others.style]}>
      <Text caption color={!focus ? 'contentLight' : undefined} pointerEvents="none" style={style.label}>
        {label}
      </Text>
      <TextInput
        autoCapitalize="none"
        autoCorrect
        blurOnSubmit
        editable
        keyboardType={keyboard}
        placeholder={!focus ? '...' : undefined}
        style={style.input}
        underlineColorAndroid="transparent"
        value={value}
        onBlur={() => setFocus(false)}
        onChangeText={handleChange}
        onFocus={() => setFocus(true)}
        onSubmitEditing={Keyboard.dismiss}
      />
    </View>
  );
};

Input.propTypes = {
  keyboard: PropTypes.string,
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func,
};

export { Input };
