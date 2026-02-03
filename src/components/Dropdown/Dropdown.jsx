import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, TouchableOpacity } from 'react-native';

import { theme } from '../../config/theme';
import { useApp } from '../../contexts';
import { useMotion } from '../../hooks/useMotion';
import { Icon, ScrollView, Text, View } from '../../design-system';

const Dropdown = ({
  visible,
  onClose,
  options = [],
  selected,
  onSelect,
  renderOption,
  position = 'bottom',
  maxItems = 6,
  itemHeight: itemHeightProp,
  optionStyle,
  width = 200,
}) => {
  const { colors } = useApp();
  const { animateValue, createValue } = useMotion();
  const scrollRef = useRef(null);
  const [measuredItemHeight, setMeasuredItemHeight] = useState();

  const fadeAnim = createValue(0);
  const scaleAnim = createValue(0.95);
  const fallbackItemHeight = 42;
  const itemHeight = itemHeightProp || measuredItemHeight || fallbackItemHeight;

  useEffect(() => {
    if (visible) {
      animateValue(fadeAnim, 1, { useNativeDriver: true });
      animateValue(scaleAnim, 1, { useNativeDriver: true });
    } else {
      animateValue(fadeAnim, 0, { useNativeDriver: true });
      animateValue(scaleAnim, 0.95, { useNativeDriver: true });
    }
  }, [visible, animateValue, fadeAnim, scaleAnim]);

  const renderDefaultOption = (option, isSelected) => (
    <View style={styles.optionContent}>
      <Text caption color={isSelected ? 'accent' : undefined} bold={isSelected}>
        {option.label}
      </Text>
      {isSelected ? <Icon name="check" color="accent" /> : null}
    </View>
  );

  const renderOptionContent = (option) => {
    const isSelected = option.id === selected;
    return renderOption ? renderOption(option, isSelected) : renderDefaultOption(option, isSelected);
  };

  const getDropdownStyle = () => {
    const calculatedMaxHeight = Math.min(options.length, maxItems) * itemHeight;

    const baseStyle = {
      opacity: fadeAnim,
      transform: [{ scale: scaleAnim }],
      maxHeight: calculatedMaxHeight,
      width,
    };

    let positionStyle = {};

    if (position === 'bottom') {
      positionStyle = { position: 'absolute', top: 8, left: 0, zIndex: 1001 };
    } else if (position === 'top') {
      positionStyle = { position: 'absolute', top: -calculatedMaxHeight - 8, left: 0, zIndex: 1001 };
    } else if (position === 'right') {
      positionStyle = { position: 'absolute', top: -32, left: 60, zIndex: 1001 };
    } else if (position === 'left') {
      positionStyle = { position: 'absolute', top: -32, right: 60, zIndex: 1001 };
    }

    return [styles.dropdownRelative, baseStyle, positionStyle, { backgroundColor: colors.surface, borderColor: colors.border }];
  };

  useEffect(() => {
    if (!visible || !options.length || selected === undefined || selected === null) return;
    const selectedIndex = options.findIndex((option) => option.id === selected);
    if (selectedIndex < 0) return;
    const offset = Math.max(0, (selectedIndex - 1) * itemHeight);
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: offset, animated: false });
    });
  }, [itemHeight, options, selected, visible]);

  if (!visible) return null;

  return (
    <>
      <TouchableOpacity activeOpacity={1} onPress={onClose} style={styles.backdrop} />
      <Animated.View style={getDropdownStyle()}>
        <ScrollView
          bounces={false}
          ref={scrollRef}
          showsVerticalScrollIndicator={options.length > maxItems}
          style={[styles.scrollView, { maxHeight: Math.min(options.length, maxItems) * itemHeight }]}
        >
          {options.map((option, index) => (
            <TouchableOpacity
              activeOpacity={0.7}
              key={option.id || index}
              onLayout={
                index === 0
                  ? (event) => {
                      const height = event.nativeEvent.layout.height;
                      if (height && height !== measuredItemHeight) setMeasuredItemHeight(height);
                    }
                  : undefined
              }
              onPress={() => onSelect(option)}
              style={[
                styles.option,
                optionStyle,
                index === options.length - 1 && styles.lastOption,
                { borderBottomColor: colors.border },
              ]}
            >
              {renderOptionContent(option)}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    zIndex: 999,
  },
  dropdownRelative: {
    borderRadius: theme.borderRadius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: theme.spacing.xs },
    shadowOpacity: 0.15,
    shadowRadius: theme.spacing.md,
    elevation: 8,
  },
  scrollView: {
    maxHeight: '100%',
  },
  option: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

export default Dropdown;
