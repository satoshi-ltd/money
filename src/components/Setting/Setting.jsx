import React from 'react';
import { ActivityIndicator } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

import { Icon, Pressable, Text, View } from '../../design-system';
import Card from '../Card';
import { resolveColor } from '../utils/resolveColor';
import { ICON } from '../../modules';
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
  ...props
}) => {
  const resolvedBackground = resolveColor(color);
  const selectedIndex = options?.findIndex((option) => option?.id === selected || option?.value === selected);
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : options?.[0];

  const handlePress = () => {
    if (disabled) return;
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
      onPress={handlePress}
      style={[styles.container, resolvedBackground ? { backgroundColor: resolvedBackground } : null, disabled && styles.disabled, style]}
    >
      <View style={styles.row}>
        <View style={styles.left}>
          {icon ? (
            <Card small style={styles.iconCard}>
              <Icon name={icon} color={iconColor || 'content'} />
            </Card>
          ) : null}
          <View flex>
            <Text bold>{text}</Text>
            {caption ? (
              <Text caption color="contentLight">
                {caption}
              </Text>
            ) : null}
          </View>
        </View>
        {activity ? (
          <ActivityIndicator size="small" color={StyleSheet.value('$colorContentLight')} />
        ) : options?.length ? (
          <Text caption color="contentLight" style={styles.rightText}>
            {resolveOptionLabel(selectedOption)}
          </Text>
        ) : (
          <Icon name={ICON.RIGHT} color="contentLight" />
        )}
      </View>
    </Pressable>
  );
};

export default Setting;
