import { Text, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Keyboard, TextInput } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

import { style } from './InputText.style';

const InputText = ({ keyboard = 'default', label, value = '', onChange, ...others }) => {
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
        placeholderTextColor={StyleSheet.value('$inputPlaceholderColor')}
        underlineColorAndroid="transparent"
        value={value}
        onBlur={() => setFocus(false)}
        onChangeText={handleChange}
        onFocus={() => setFocus(true)}
        onSubmitEditing={Keyboard.dismiss}
        style={style.input}
      />
    </View>
  );
};

InputText.propTypes = {
  keyboard: PropTypes.string,
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func,
};

export { InputText };
