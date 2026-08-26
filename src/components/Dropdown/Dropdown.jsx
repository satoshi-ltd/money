import React, { useEffect, useRef, useState } from 'react';
import { Animated, Modal, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { dropdownOrigin, dropdownPlacement } from './helpers';
import { useApp } from '../../contexts';
import { ICON } from '../../modules';
import { useMotion } from '../../hooks/useMotion';
import { Icon, ScrollView, Text, View } from '../../primitives';
import { theme } from '../../theme';
import { dropdownWidth, rowHeight, wellSize } from '../../theme/layout';

const EDGE = theme.spacing.md;
const OFFSET = theme.spacing.xs;

const Dropdown = ({
  align = 'right',
  visible,
  onClose,
  options = [],
  selected,
  onSelect,
  renderOption,
  position = 'auto',
  maxItems = 8,
  itemHeight: itemHeightProp,
  optionStyle,
  width = dropdownWidth,
}) => {
  const { colors } = useApp();
  const { animateValue, createValue } = useMotion();
  const { bottom: bottomInset, top: topInset } = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const scrollRef = useRef(null);
  const boxRef = useRef(null);
  const measured = useRef(false);
  const [anchor, setAnchor] = useState();

  const fadeAnim = createValue(0);
  const scaleAnim = createValue(0.95);
  const itemHeight = itemHeightProp || rowHeight;

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
    <View row style={styles.optionContent}>
      {option.symbol ? (
        <View style={[styles.well, { backgroundColor: colors.surface }]}>
          <Text figure={option.symbolSize || 'xs'}>{option.symbol}</Text>
        </View>
      ) : null}
      <Text flex medium={isSelected} numberOfLines={1} size="s">
        {option.label}
      </Text>
      {isSelected ? <Icon name={ICON.CHECK} size="s" tone="accent" /> : null}
    </View>
  );

  const renderOptionContent = (option) => {
    const isSelected = option.id === selected;
    return renderOption ? renderOption(option, isSelected) : renderDefaultOption(option, isSelected);
  };

  // Measured once per open, then the list sizes and flips to whatever room the anchor actually has.
  const handleLayout = () => {
    if (measured.current) return;
    boxRef.current?.measureInWindow((x, y, measuredWidth) => {
      measured.current = true;
      setAnchor({ left: x, top: y, width: measuredWidth });
    });
  };

  const placement = dropdownPlacement({
    anchorTop: anchor?.top,
    bottomInset,
    count: options.length,
    edge: EDGE,
    itemHeight,
    maxItems,
    offset: OFFSET,
    topInset,
    windowHeight,
  });

  const getDropdownStyle = () => {
    const height = placement.height;
    const side = position === 'auto' ? placement.side : position;

    const base = {
      borderColor: colors.border,
      backgroundColor: colors.background,
      height,
      opacity: fadeAnim,
      position: 'absolute',
      transform: [{ scale: scaleAnim }],
      width,
    };

    if (!anchor) return [styles.dropdownRelative, base, styles.hidden];

    return [
      styles.dropdownRelative,
      base,
      dropdownOrigin({ align, anchor, edge: EDGE, height, offset: OFFSET, side, topInset, width }),
    ];
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
      <View onLayout={handleLayout} ref={boxRef} style={styles.probe} />
      <Modal animationType="none" onRequestClose={onClose} statusBarTranslucent transparent visible>
        <TouchableOpacity activeOpacity={1} onPress={onClose} style={styles.backdrop} />
        <Animated.View style={getDropdownStyle()}>
          <ScrollView bounces={false} ref={scrollRef} showsVerticalScrollIndicator style={styles.scrollView}>
            {options.map((option, index) => (
              <TouchableOpacity
                activeOpacity={0.7}
                key={option.id || index}
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
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  hidden: {
    opacity: 0,
  },
  // Stays behind in the row so the list, which lives in its own window, still knows where its trigger is.
  probe: {
    height: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  dropdownRelative: {
    borderRadius: theme.borderRadius.none,
    borderWidth: theme.hairline,
    ...theme.shadows.overlay,
  },
  scrollView: {
    maxHeight: '100%',
  },
  option: {
    borderBottomWidth: theme.hairline,
    height: rowHeight,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.sm,
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  optionContent: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  well: {
    alignItems: 'center',
    borderRadius: theme.borderRadius.sm,
    height: wellSize,
    justifyContent: 'center',
    width: wellSize,
  },
});

export default Dropdown;
