import DateTimePicker from '@react-native-community/datetimepicker';
import { Text, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React from 'react';
import { Platform } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

import { style } from './InputDate.style';
import { useStore } from '../../contexts';
import { verboseDate } from '../../modules';

const DATE_FORMAT = { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };

const InputDate = ({ disabled = false, value = new Date(), onChange = () => {}, ...others }) => {
  const { session: { locale } = {}, settings: { theme } = {} } = useStore();

  const handleChange = (event, nextDate) => {
    onChange(new Date(nextDate));
  };

  const handleChangeInput = ({ target: { value } = {} } = {}) => {
    onChange(new Date(value));
  };

  return disabled ? (
    <Text bold color="contentLight" secondary>
      {verboseDate(value, { locale, ...DATE_FORMAT })}
    </Text>
  ) : Platform.OS !== 'web' ? (
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
  ) : (
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
  );
};

InputDate.displayName = 'InputDate';

InputDate.propTypes = {
  disabled: PropTypes.bool,
  value: PropTypes.any,
  onChange: PropTypes.func,
};

export { InputDate };
