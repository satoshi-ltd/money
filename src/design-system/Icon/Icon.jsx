import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet as RNStyleSheet } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

import { resolveColor } from '../../components/utils/resolveColor';

const Icon = ({ caption, color, size, small, subtitle, title, style, ...props }) => {
  const resolvedSize =
    size ||
    (title && StyleSheet.value('$iconSizeTitle')) ||
    (subtitle && StyleSheet.value('$iconSizeSubtitle')) ||
    (caption && StyleSheet.value('$iconSizeCaption')) ||
    (small && StyleSheet.value('$iconSizeSmall')) ||
    StyleSheet.value('$iconSize');

  const flattenedStyle = RNStyleSheet.flatten(style) || {};
  const resolvedColor = resolveColor(color || flattenedStyle.color, StyleSheet.value('$colorContent'));

  return <MaterialCommunityIcons {...props} color={resolvedColor} size={resolvedSize} style={style} />;
};

export default Icon;
