import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Keyboard, TextInput } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

import { Field } from '../Field';
import { style } from './InputText.style';

const InputText = ({ first, keyboard = 'default', label, last, value = '', onChange, ...others }) => {
  const [focus, setFocus] = useState(false);

  const handleChange = (next = '') => {
    onChange && onChange(next.toString().length > 0 ? next : undefined);
  };

  return (
    <Field focused={focus} label={label} first={first} last={last} style={others.style}>
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
    </Field>
  );
};

InputText.propTypes = {
  first: PropTypes.bool,
  keyboard: PropTypes.string,
  label: PropTypes.string.isRequired,
  last: PropTypes.bool,
  value: PropTypes.string,
  onChange: PropTypes.func,
};

export { InputText };
