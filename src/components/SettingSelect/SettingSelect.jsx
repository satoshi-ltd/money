import PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';

import { getStyles } from './SettingSelect.style';
import { useApp } from '../../contexts';
import { ICON } from '../../modules';
import { Icon, Pressable, Text, View } from '../../primitives';
import Dropdown from '../Dropdown';

const SettingSelect = ({ divider, onChange, options = [], subtitle, title, value }) => {
  const { colors } = useApp();
  const style = useMemo(() => getStyles(colors), [colors]);
  const [open, setOpen] = useState(false);

  const selected = options.find((option) => option.value === value);

  return (
    <View style={style.wrapper}>
      <Pressable style={[style.row, divider && style.divider]} onPress={() => setOpen(true)}>
        <View flex>
          <Text medium>{title}</Text>
          {subtitle ? (
            <Text size="xs" tone="muted">
              {subtitle}
            </Text>
          ) : null}
        </View>
        <Text numberOfLines={1} size="s" tone="muted">
          {selected?.label}
        </Text>
        <Icon name={ICON.DOWN} size="s" tone="muted" />
      </Pressable>

      <Dropdown
        options={options.map((option) => ({ ...option, id: option.value }))}
        selected={value}
        visible={open}
        onClose={() => setOpen(false)}
        onSelect={(option) => {
          setOpen(false);
          if (option.value !== value) onChange?.(option.value);
        }}
      />
    </View>
  );
};

SettingSelect.displayName = 'SettingSelect';

SettingSelect.propTypes = {
  divider: PropTypes.bool,
  onChange: PropTypes.func,
  options: PropTypes.arrayOf(PropTypes.shape({ label: PropTypes.string, value: PropTypes.any })),
  subtitle: PropTypes.string,
  title: PropTypes.string,
  value: PropTypes.any,
};

export { SettingSelect };
