import React, { useMemo } from 'react';
import { ActivityIndicator, Switch } from 'react-native';

import { useApp } from '../../contexts';
import { ICON } from '../../modules';
import { Icon, Pressable, Text, View } from '../../primitives';
import Card from '../Card';
import { getStyles } from './Setting.styles';

const resolveOptionLabel = (option) => option?.text || option?.label || option?.caption || option?.value;

const Setting = ({
  activity,
  disabled,
  icon,
  iconTone,
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
      style={[styles.container, disabled && styles.disabled, style]}
    >
      <View style={styles.row}>
        <View style={styles.left}>
          {icon ? (
            <Card style={styles.iconCard} size="s">
              <Icon name={icon} tone={iconTone || 'primary'} />
            </Card>
          ) : null}
          <View flex>
            {titleTone ? (
              <Text bold tone={titleTone}>
                {title}
              </Text>
            ) : (
              <Text bold>{title}</Text>
            )}
            {subtitle ? (
              <Text tone={subtitleTone || 'secondary'} size="s">
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
            thumbColor={colors.background}
            trackColor={{ false: colors.border, true: colors.accent }}
            style={styles.switch}
            value={!!value}
            onValueChange={onValueChange}
          />
        ) : options?.length ? (
          <Text tone="secondary" style={styles.rightText} size="s">
            {resolveOptionLabel(selectedOption)}
          </Text>
        ) : type === 'navigation' ? (
          <Icon name={ICON.RIGHT} tone="secondary" />
        ) : null}
      </View>
    </Pressable>
  );
};

export default Setting;
