import DateTimePicker from '@react-native-community/datetimepicker';
import { Pressable, Text, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Platform } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

import { style } from './InputDate.style';
import { useStore } from '../../contexts';
import { C, verboseDate } from '../../modules';

const DATE_FORMAT = { day: 'numeric', month: 'long', year: 'numeric' };

const InputDate = ({ disabled = false, value = new Date(), onChange = () => {}, ...others }) => {
  const { session: { locale } = {}, settings: { theme } = {} } = useStore();
  const [open, setOpen] = useState(C.IS_IOS ? true : false);

  const handleChange = (event, nextDate) => {
    onChange(new Date(nextDate));
    setOpen(false);
  };

  const handleChangeInput = ({ target: { value } = {} } = {}) => {
    onChange(new Date(value));
  };

  return (
    <>
      {disabled && (
        <Text bold color="contentLight" secondary>
          {verboseDate(value, { locale, ...DATE_FORMAT })}
        </Text>
      )}
      {!disabled && Platform.OS === 'web' && (
        <View row>
          <input
            type="date"
            max={new Date().toISOString().split('T')[0]}
            value={value ? value.toISOString().split('T')[0] : undefined}
            onChange={handleChangeInput}
            style={style.input}
          />
          <Text bold color="contentLight" secondary>
            {verboseDate(value, { locale, ...DATE_FORMAT })}
          </Text>
        </View>
      )}
      {!disabled && !open && (
        <Pressable onPress={() => setOpen(true)}>
          <Text bold color="contentLight" secondary>
            {verboseDate(value, { locale, ...DATE_FORMAT })}
          </Text>
        </Pressable>
      )}
      {!disabled && open && (
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
          style={[style.dateTimePicker, others.style]}
        />
      )}
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
