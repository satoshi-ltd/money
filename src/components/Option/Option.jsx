import React from 'react';
import { Switch, TouchableOpacity } from 'react-native';
import { StyleSheet } from 'react-native';

import { useApp } from '../../contexts';
import { Icon, Text, View } from '../../primitives';
import { theme } from '../../theme';

const Option = ({
  icon,
  title,
  subtitle,
  onPress,
  rightElement,
  selected = false,
  disabled = false,
  badge,
  leftElement,
  type = 'navigation',
  value,
  onValueChange,
  counter,
}) => {
  const { colors } = useApp();

  const renderRightElement = () => {
    if (rightElement) return rightElement;

    switch (type) {
      case 'toggle':
        return (
          <Switch
            disabled={disabled}
            thumbColor={colors.background}
            trackColor={{ false: colors.border, true: colors.accent }}
            value={value}
            onValueChange={onValueChange}
          />
        );
      case 'navigation':
        return selected ? <Icon tone="accent" name="check" /> : <Icon tone="secondary" name="chevron-right" />;
      default:
        return null;
    }
  };

  const content = (
    <View style={[styles.container, { borderBottomColor: colors.border }, disabled && styles.disabled]}>
      {leftElement ? (
        <View style={styles.leftElement}>{leftElement}</View>
      ) : icon ? (
        <Icon name={icon} style={styles.icon} />
      ) : null}

      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text numberOfLines={1} bold={selected}>
            {title}
          </Text>
          {counter !== undefined && counter !== null ? (
            <View style={[styles.counterBadge, { backgroundColor: colors.accent }]}>
              <Text bold tone="onAccent" size="xs">
                {counter}
              </Text>
            </View>
          ) : null}
          {badge ? (
            <View style={[styles.badge, { backgroundColor: `${colors.textSecondary}20` }]}>
              <Text bold tone="secondary" size="xs">
                {badge}
              </Text>
            </View>
          ) : null}
        </View>
        {subtitle ? (
          <Text tone="secondary" numberOfLines={1} size="s">
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={styles.rightContainer}>{renderRightElement()}</View>
    </View>
  );

  if (type === 'toggle' || disabled || !onPress) {
    return <View style={styles.wrapper}>{content}</View>;
  }

  return (
    <TouchableOpacity activeOpacity={0.7} disabled={disabled} onPress={onPress} style={styles.wrapper}>
      {content}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: theme.spacing.md,
    marginBottom: StyleSheet.hairlineWidth,
    borderRadius: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
    minHeight: theme.spacing.xxl + theme.spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  disabled: {
    opacity: 0.5,
  },
  leftElement: {
    marginRight: theme.spacing.sm,
    width: theme.spacing.xl,
    alignItems: 'center',
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.sm,
  },
  counterBadge: {
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.sm,
    minWidth: theme.spacing.lg - theme.spacing.xs,
    alignItems: 'center',
  },
  rightContainer: {
    marginLeft: theme.spacing.md,
  },
});

export default Option;
