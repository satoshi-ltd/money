import DateTimePicker from '@react-native-community/datetimepicker';
import { Pressable, Text } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React, { useRef, useState } from 'react';
import { Platform } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

import { style } from './InputDate.style';
import { useStore } from '../../contexts';
import { verboseDate } from '../../modules';

const DATE_FORMAT = { day: 'numeric', month: 'long', year: 'numeric' };

const InputDate = ({ value = new Date(), onChange = () => {} }) => {
  const inputRef = useRef(null);
  const { session: { locale } = {}, settings: { theme } = {} } = useStore();

  const [open, setOpen] = useState(false);

  const handlePress = () => {
    if (inputRef.current) {
      inputRef.current.showPicker?.();
      inputRef.current.focus();
    }
  };

  const handleChange = (event, nextDate) => {
    onChange(new Date(nextDate));
    setOpen(false);
  };

  const handleChangeInput = ({ target: { value } = {} } = {}) => {
    onChange(new Date(value));
  };

  return Platform.OS !== 'web' ? (
    Platform.OS === 'ios' || open ? (
      <DateTimePicker
        accentColor={StyleSheet.value('$colorAccent')}
        is24Hour
        maximumDate={new Date()}
        mode="date"
        display="default"
        textColor={StyleSheet.value('$colorContent')}
        themeVariant={theme}
        value={value}
        onChange={handleChange}
        style={style.dateTimePicker}
      />
    ) : (
      <Pressable onPress={() => setOpen(true)} style={style.pressable}>
        <Text>{verboseDate(value, { locale, ...DATE_FORMAT })}</Text>
      </Pressable>
    )
  ) : (
    <>
      <input
        ref={inputRef}
        type="date"
        max={new Date().toISOString().split('T')[0]}
        value={value ? value.toISOString().split('T')[0] : undefined}
        onChange={handleChangeInput}
        style={style.inputWeb}
      />
      <Pressable onPress={handlePress} style={style.pressable}>
        <Text>{verboseDate(value, { locale, ...DATE_FORMAT })}</Text>
      </Pressable>
    </>
  );
};

InputDate.displayName = 'InputDate';

InputDate.propTypes = {
  disabled: PropTypes.bool,
  value: PropTypes.any,
  onChange: PropTypes.func,
};

export { InputDate };
