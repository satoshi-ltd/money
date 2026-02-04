import { Icon, Pressable, Text, View } from '../../primitives';
import PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';
import StyleSheet from 'react-native-extended-stylesheet';

import Card from '../Card';
import { CurrencyLogo } from '../CurrencyLogo';
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

  const renderCurrencyOption = (option, isSelected) => (
    <View row style={style.optionRow}>
      <Card small style={[style.iconCard, style.iconCardDropdown]}>
        <CurrencyLogo currency={option.value} />
      </Card>
      <View flex style={style.optionTextContainer}>
        <Text bold numberOfLines={1} style={style.optionText}>
          {option.label}
        </Text>
      </View>
      {isSelected ? <Icon name="check" tone="accent" /> : null}
    </View>
  );

  return (
    <Field focused={open} first={first} last={last}>
      <Pressable onPress={() => setOpen(true)}>
        <View row spaceBetween style={style.row}>
          <View row style={style.rowContent}>
            {value ? (
              <Card small style={style.iconCard}>
                <CurrencyLogo currency={value} />
              </Card>
            ) : null}
            <View>
              <Text tone="secondary" size="s">
                {label}
              </Text>
              <Text bold numberOfLines={1} style={[style.text, style.selectedValue]}>
                {selectedLabel}
              </Text>
            </View>
          </View>
          <Icon name="chevron-down" tone="secondary" />
        </View>
      </Pressable>

      <Dropdown
        maxItems={6}
        onClose={() => setOpen(false)}
        onSelect={(option) => {
          onChange(option.value);
          setOpen(false);
        }}
        options={currencyOptions}
        optionStyle={style.option}
        renderOption={renderCurrencyOption}
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
