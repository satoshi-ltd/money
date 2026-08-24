import React, { useMemo } from 'react';
import { ActivityIndicator, Switch } from 'react-native';

import { useApp } from '../../contexts';
import { ICON } from '../../modules';
import { Icon, Pressable, Text, View } from '../../primitives';
import { getStyles } from './Setting.styles';

const resolveOptionLabel = (option) => option?.text || option?.label || option?.caption || option?.value;

const Setting = ({
  activity,
  disabled,
  divider,
  subtitleTone,
  titleTone,
  onChange,
  onPress,
  options,
  right,
  selected,
  style,
  subtitle,
  title,
  type = 'navigation',
  value,
  onValueChange,
  ...props
}) => {
  const { colors } = useApp();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const selectedIndex = options?.findIndex((option) => option?.id === selected || option?.value === selected);
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : options?.[0];
  const isToggle = type === 'toggle';

  const handlePress = () => {
    if (disabled) return;
    if (isToggle && onValueChange) {
      onValueChange(!value);
      return;
    }
    if (options?.length && onChange) {
      const nextIndex = selectedIndex >= 0 ? (selectedIndex + 1) % options.length : 0;
      onChange(options[nextIndex]);
    }
    if (onPress) onPress();
  };

  return (
    <Pressable
      {...props}
      disabled={disabled}
      onPress={isToggle ? undefined : handlePress}
      style={[styles.container, divider ? styles.divider : null, disabled && styles.disabled, style]}
    >
      <View style={styles.row}>
        <View style={styles.left}>
          <View flex>
            <Text medium tone={titleTone}>
              {title}
            </Text>
            {subtitle ? (
              <Text size="xs" tone={subtitleTone || 'muted'}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>
        {right ? (
          right
        ) : activity ? (
          <ActivityIndicator size="small" color={colors.textSecondary} />
        ) : isToggle ? (
          <Switch
            disabled={disabled}
            ios_backgroundColor={colors.surfaceSoft}
            thumbColor={colors.surface}
            trackColor={{ false: colors.surfaceSoft, true: colors.accent }}
            style={styles.switch}
            value={!!value}
            onValueChange={onValueChange}
          />
        ) : options?.length ? (
          <Text size="s" style={styles.rightText} tone="muted">
            {resolveOptionLabel(selectedOption)}
          </Text>
        ) : type === 'navigation' ? (
          <Icon name={ICON.RIGHT} size="s" tone="muted" />
        ) : null}
      </View>
    </Pressable>
  );
};

export default Setting;
