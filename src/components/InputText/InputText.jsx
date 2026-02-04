import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Keyboard } from 'react-native';

import { Field } from '../Field';
import { Input } from '../../primitives';
import { style } from './InputText.style';

const InputText = ({ disabled, first, keyboardType = 'default', label, last, value = '', onChange, ...others }) => {
  const [focus, setFocus] = useState(false);

  const handleChange = (next = '') => {
    onChange && onChange(next.toString().length > 0 ? next : undefined);
  };

  return (
    <Field focused={focus} label={label} first={first} last={last} style={others.style}>
      <Input
        autoCorrect
        keyboardType={keyboardType}
        value={value}
        editable={!disabled}
        onBlur={() => setFocus(false)}
        onChange={handleChange}
        onFocus={() => setFocus(true)}
        onSubmitEditing={Keyboard.dismiss}
        style={style.input}
      />
    </Field>
  );
};

InputText.propTypes = {
  disabled: PropTypes.bool,
  first: PropTypes.bool,
  keyboardType: PropTypes.string,
  label: PropTypes.string.isRequired,
  last: PropTypes.bool,
  value: PropTypes.string,
  onChange: PropTypes.func,
};

export { InputText };
