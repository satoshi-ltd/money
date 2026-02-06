import DateTimePicker from '@react-native-community/datetimepicker';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Platform } from 'react-native';

import { styles } from './InputDate.style';
import { useApp, useStore } from '../../contexts';
import { L10N, verboseDate } from '../../modules';
import { Pressable, Text } from '../../primitives';
import { Field } from '../Field';
import Modal from '../Modal';

const DATE_FORMAT = { day: 'numeric', month: 'long', year: 'numeric' };

const InputDate = ({
  first,
  label = L10N.DATE,
  last,
  maximumDate,
  minimumDate,
  value = new Date(),
  onChange = () => {},
}) => {
  const { session: { locale } = {}, settings: { theme } = {} } = useStore();
  const { colors } = useApp();

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
        <Pressable onPress={handlePress} style={[styles.pressable, label ? styles.pressableWithLabel : null]}>
          <Text bold style={[label ? styles.valueWithLabel : null]}>
            {verboseDate(value, { locale, ...DATE_FORMAT })}
          </Text>
        </Pressable>
      </Field>

      {open ? (
        <Modal onClose={() => setOpen(false)}>
          <DateTimePicker
            accentColor={colors.accent}
            is24Hour
            maximumDate={maximumDate instanceof Date ? maximumDate : undefined}
            minimumDate={minimumDate instanceof Date ? minimumDate : undefined}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
            textColor={colors.text}
            themeVariant={theme}
            value={value}
            onChange={handleChange}
            style={styles.dateTimePicker}
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
  maximumDate: PropTypes.any,
  minimumDate: PropTypes.any,
  value: PropTypes.any,
  onChange: PropTypes.func,
};

export { InputDate };
