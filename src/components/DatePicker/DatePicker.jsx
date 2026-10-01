import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import PropTypes from 'prop-types';
import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import { useApp } from '../../contexts';
import Modal from '../Modal';

const DatePicker = ({ maximumDate, minimumDate, onClose, onSelect, value }) => {
  const { colors, theme: themeMode } = useApp();
  const android = Platform.OS === 'android';
  const answered = useRef(false);
  const latest = useRef({ onClose, onSelect });
  latest.current = { onClose, onSelect };

  useEffect(() => {
    if (!android) return undefined;

    DateTimePickerAndroid.open({
      display: 'calendar',
      is24Hour: true,
      maximumDate,
      minimumDate,
      mode: 'date',
      value,
      onChange: (event, date) => {
        answered.current = true;
        if (event?.type === 'set' && date) latest.current.onSelect(date);
        latest.current.onClose();
      },
    });

    return () => {
      if (answered.current) return;
      try {
        Promise.resolve(DateTimePickerAndroid.dismiss('date')).catch(() => undefined);
      } catch {
        return;
      }
    };
    // opens once per mount; later props reach the open dialog through the latest ref
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (android) return null;

  return (
    <Modal onClose={onClose}>
      <DateTimePicker
        accentColor={colors.accent}
        display="inline"
        is24Hour
        maximumDate={maximumDate}
        minimumDate={minimumDate}
        mode="date"
        textColor={colors.text}
        themeVariant={themeMode}
        value={value}
        onChange={(event, date) => {
          if (!date) return;
          onSelect(date);
          onClose();
        }}
      />
    </Modal>
  );
};

DatePicker.propTypes = {
  maximumDate: PropTypes.instanceOf(Date),
  minimumDate: PropTypes.instanceOf(Date),
  onClose: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  value: PropTypes.instanceOf(Date).isRequired,
};

export { DatePicker };
