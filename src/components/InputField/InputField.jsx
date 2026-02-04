import PropTypes from 'prop-types';
import React, { useState } from 'react';

import { Field } from '../Field';
import { Input } from '../../primitives';
import { style } from './InputField.style';

const InputField = ({
  disabled,
  first,
  inputStyle,
  label,
  last,
  onChange,
  style: styleProp,
  suffix,
  value,
  ...inputProps
}) => {
  const [focus, setFocus] = useState(false);
  const { onBlur, onFocus, ...restInputProps } = inputProps;

  const handleBlur = (event) => {
    setFocus(false);
    if (onBlur) onBlur(event);
  };

  const handleFocus = (event) => {
    setFocus(true);
    if (onFocus) onFocus(event);
  };

  return (
    <Field focused={focus} first={first} last={last} label={label} suffix={suffix} style={styleProp}>
      <Input
        editable={!disabled}
        grow
        value={value}
        onBlur={handleBlur}
        onChange={onChange}
        onFocus={handleFocus}
        style={[label ? style.inputWithLabel : style.input, inputStyle]}
        {...restInputProps}
      />
    </Field>
  );
};

InputField.propTypes = {
  disabled: PropTypes.bool,
  first: PropTypes.bool,
  inputStyle: PropTypes.any,
  label: PropTypes.string,
  last: PropTypes.bool,
  onChange: PropTypes.func,
  style: PropTypes.any,
  suffix: PropTypes.node,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export { InputField };
