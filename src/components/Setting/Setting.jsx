import React from 'react';
import { ActivityIndicator, Switch } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

import { Icon, Pressable, Text, View } from '../../primitives';
import Card from '../Card';
import { resolveColor } from '../utils/resolveColor';
import { ICON } from '../../modules';
import { useApp } from '../../contexts';
import { styles } from './Setting.styles';

const resolveOptionLabel = (option) => option?.text || option?.label || option?.caption || option?.value;

const Setting = ({
  activity,
  caption,
  color,
  disabled,
  icon,
  iconColor,
  onChange,
  onPress,
  options,
  selected,
  style,
  text,
  type = 'navigation',
  value,
  onValueChange,
  ...props
}) => {
  const { colors } = useApp();
  const resolvedBackground = resolveColor(color);
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
      style={[styles.container, resolvedBackground ? { backgroundColor: resolvedBackground } : null, disabled && styles.disabled, style]}
    >
      <View style={styles.row}>
        <View style={styles.left}>
          {icon ? (
            <Card style={styles.iconCard} size="s">
              <Icon name={icon} color={iconColor || 'content'} />
            </Card>
          ) : null}
          <View flex>
            <Text bold>{text}</Text>
            {caption ? (
              <Text tone="secondary" size="s">
                {caption}
              </Text>
            ) : null}
          </View>
        </View>
        {activity ? (
          <ActivityIndicator size="small" color={StyleSheet.value('$colorContentLight')} />
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
        ) : (
          <Icon name={ICON.RIGHT} tone="secondary" />
        )}
      </View>
    </Pressable>
  );
};

export default Setting;
