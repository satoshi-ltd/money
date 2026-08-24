import PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';

import { getStyles } from './InputCurrency.style';
import { useApp } from '../../contexts';
import { currencySymbol, ICON, L10N } from '../../modules';
import { Icon, Pressable, Text, View } from '../../primitives';
import Dropdown from '../Dropdown';
import { Field } from '../Field';

const InputCurrency = ({
  disabled,
  first,
  label = L10N.CURRENCY,
  last,
  onChange,
  options,
  style: styleProp,
  value,
}) => {
  const { colors } = useApp();
  const style = useMemo(() => getStyles(colors), [colors]);
  const [open, setOpen] = useState(false);

  const currencyOptions = useMemo(() => {
    const base = options && options.length ? options : Object.keys(L10N.CURRENCY_NAME);
    const sorted = [...base].sort((a, b) => a.localeCompare(b));
    return sorted.map((code) => ({
      id: code,
      label: L10N.CURRENCY_NAME[code] || code,
      symbol: currencySymbol(code),
      value: code,
    }));
  }, [options]);

  const well = (code) => (
    <View style={style.well}>
      <Text figure="sm">{currencySymbol(code)}</Text>
    </View>
  );

  return (
    <Field focused={open} first={first} last={last} label={label} style={styleProp}>
      <Pressable disabled={disabled} onPress={() => setOpen(true)}>
        <View row spaceBetween style={style.row}>
          <View row style={style.rowContent}>
            {value ? well(value) : null}
            <Text medium numberOfLines={1}>
              {value ? `${value} · ${L10N.CURRENCY_NAME[value] || value}` : '…'}
            </Text>
          </View>
          {!disabled ? <Icon name={ICON.DOWN} size="s" tone="muted" /> : null}
        </View>
      </Pressable>

      <Dropdown
        onClose={() => setOpen(false)}
        onSelect={(option) => {
          onChange(option.value);
          setOpen(false);
        }}
        options={currencyOptions}
        selected={value}
        visible={open}
      />
    </Field>
  );
};

InputCurrency.propTypes = {
  disabled: PropTypes.bool,
  first: PropTypes.bool,
  label: PropTypes.string,
  last: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.string),
  style: PropTypes.any,
  value: PropTypes.string,
};

export { InputCurrency };
