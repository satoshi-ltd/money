import React from 'react';
import { TextInput } from 'react-native';

import { styles } from './Input.styles';

const Input = React.forwardRef(
  ({ multiline = false, variant, onChange, onChangeText, style, placeholder, value, ...props }, ref) => {
    const handleChangeText = (text) => {
      if (onChangeText) onChangeText(text);
      if (onChange) onChange(text);
    };

    return (
      <TextInput
        ref={ref}
        multiline={multiline}
        placeholder={placeholder}
        placeholderTextColor={styles.placeholder.color}
        value={value}
        onChangeText={handleChangeText}
        {...props}
        style={[styles.base, variant === 'search' ? styles.search : null, multiline ? styles.multiline : null, style]}
      />
    );
  },
);

Input.displayName = 'Input';

export default Input;
