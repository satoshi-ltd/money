import React, { useMemo } from 'react';
import { TextInput } from 'react-native';

import { getStyles } from './Input.styles';
import { useApp } from '../../contexts';

const Input = React.forwardRef(
  (
    {
      blurOnSubmit = true,
      editable = true,
      grow = false,
      multiline = false,
      onBlur,
      onChange,
      onChangeText,
      onFocus,
      placeholder,
      placeholderWhenBlur = '...',
      style,
      value,
      ...props
    },
    ref,
  ) => {
    const { colors } = useApp();
    const styles = useMemo(() => getStyles(colors), [colors]);
    const [focused, setFocused] = React.useState(false);

    const handleChangeText = (text) => {
      if (onChangeText) onChangeText(text);
      if (onChange) onChange(text);
    };

    const handleBlur = (event) => {
      setFocused(false);
      if (onBlur) onBlur(event);
    };

    const handleFocus = (event) => {
      setFocused(true);
      if (onFocus) onFocus(event);
    };

    const resolvedPlaceholder = placeholder !== undefined ? placeholder : focused ? undefined : placeholderWhenBlur;

    return (
      <TextInput
        ref={ref}
        autoCapitalize="none"
        autoCorrect={false}
        blurOnSubmit={blurOnSubmit}
        editable={editable}
        multiline={multiline}
        placeholder={resolvedPlaceholder}
        placeholderTextColor={styles.placeholderColor.color}
        underlineColorAndroid="transparent"
        value={value}
        onBlur={handleBlur}
        onChangeText={handleChangeText}
        onFocus={handleFocus}
        {...props}
        style={[styles.base, grow ? styles.grow : null, multiline ? styles.multiline : null, style]}
      />
    );
  },
);

Input.displayName = 'Input';

export default Input;
