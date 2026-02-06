import PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';

import { useApp } from '../../contexts';
import { L10N } from '../../modules';
import { Icon, Pressable, Text, View } from '../../primitives';
import { optionSize } from '../../theme/layout';
import Card from '../Card';
import { CurrencyLogo } from '../CurrencyLogo';
import Dropdown from '../Dropdown';
import { Field } from '../Field';
import { getStyles } from './InputCurrency.style';

const InputCurrency = ({ disabled, first, label = L10N.CURRENCY, last, onChange, options, value }) => {
  const { colors } = useApp();
  const style = useMemo(() => getStyles(colors), [colors]);
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
      <Card style={[style.iconCard, style.iconCardDropdown]} size="s">
        <CurrencyLogo currency={option.value} />
      </Card>
      <View flex style={style.optionTextContainer}>
        <Text bold numberOfLines={1} style={style.optionTextWeb}>
          {option.label}
        </Text>
      </View>
      {isSelected ? <Icon name="check" tone="accent" /> : null}
    </View>
  );

  return (
    <Field focused={open} first={first} last={last} label={label}>
      <Pressable disabled={disabled} onPress={() => setOpen(true)}>
        <View row spaceBetween style={style.row}>
          <View row style={style.rowContent}>
            {value ? (
              <Card style={style.iconCard} size="s">
                <CurrencyLogo currency={value} />
              </Card>
            ) : null}
            <View>
              <Text bold numberOfLines={1} style={style.selectedValue}>
                {selectedLabel}
              </Text>
            </View>
          </View>
          {!disabled ? <Icon name="chevron-down" tone="secondary" /> : null}
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
        width={optionSize * 2.8}
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
  value: PropTypes.string,
};

export { InputCurrency };
