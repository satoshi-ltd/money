import DateTimePicker from '@react-native-community/datetimepicker';
import { Pressable, Text } from '../../primitives';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Platform } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

import { style } from './InputDate.style';
import { Field } from '../Field';
import Modal from '../Modal';
import { useStore } from '../../contexts';
import { L10N, verboseDate } from '../../modules';

const DATE_FORMAT = { day: 'numeric', month: 'long', year: 'numeric' };

const InputDate = ({ first, label = L10N.DATE, last, value = new Date(), onChange = () => {} }) => {
  const { session: { locale } = {}, settings: { theme } = {} } = useStore();

  const [open, setOpen] = useState(false);

  const handlePress = () => setOpen(true);

  const handleChange = (event, nextDate) => {
    if (!nextDate) return;
    onChange(new Date(nextDate));
    setOpen(false);
  };

  return (
    <>
      <Field focused={open} label={label} first={first} last={last}>
        <Pressable onPress={handlePress} style={style.pressable}>
          <Text bold style={[style.value, label ? style.valueWithLabel : null]}>
            {verboseDate(value, { locale, ...DATE_FORMAT })}
          </Text>
        </Pressable>
      </Field>

      {open ? (
        <Modal onClose={() => setOpen(false)}>
          <DateTimePicker
            accentColor={StyleSheet.value('$colorAccent')}
            is24Hour
            maximumDate={new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
            textColor={StyleSheet.value('$colorContent')}
            themeVariant={theme}
            value={value}
            onChange={handleChange}
            style={style.dateTimePicker}
          />
        </Modal>
      ) : null}
    </>
  );
};

InputDate.displayName = 'InputDate';

InputDate.propTypes = {
  first: PropTypes.bool,
  label: PropTypes.string,
  last: PropTypes.bool,
  disabled: PropTypes.bool,
  value: PropTypes.any,
  onChange: PropTypes.func,
};

export { InputDate };
