import { Icon, Pressable, Text, View } from '../../design-system';
import PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';
import StyleSheet from 'react-native-extended-stylesheet';

import Dropdown from '../Dropdown';
import { Field } from '../Field';
import { L10N } from '../../modules';
import { style } from './InputCurrency.style';

const InputCurrency = ({ first, label = L10N.CURRENCY, last, onChange, options, value }) => {
  const [open, setOpen] = useState(false);

  const currencyOptions = useMemo(() => {
    const base = options && options.length ? options : Object.keys(L10N.CURRENCY_NAME);
    const sorted = [...base].sort((a, b) => (L10N.CURRENCY_NAME[a] || a).localeCompare(L10N.CURRENCY_NAME[b] || b));
    return sorted.map((code) => ({
      id: code,
      label: L10N.CURRENCY_NAME[code] || code,
      value: code,
    }));
  }, [options]);

  const selectedLabel = value ? L10N.CURRENCY_NAME[value] || value : '...';

  return (
    <Field focused={open} label={label} first={first} last={last}>
      <Pressable onPress={() => setOpen(true)}>
        <View row spaceBetween style={style.row}>
          <Text bold numberOfLines={1} style={style.text}>
            {selectedLabel}
          </Text>
          <Icon name="chevron-down" color="contentLight" />
        </View>
      </Pressable>

      <Dropdown
        maxItems={8}
        onClose={() => setOpen(false)}
        onSelect={(option) => {
          onChange(option.value);
          setOpen(false);
        }}
        options={currencyOptions}
        selected={value}
        visible={open}
        width={StyleSheet.value('$optionSize') * 2.8}
      />
    </Field>
  );
};

InputCurrency.propTypes = {
  first: PropTypes.bool,
  label: PropTypes.string,
  last: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.string),
  value: PropTypes.string,
};

export { InputCurrency };

