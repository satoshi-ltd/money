import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet as RNStyleSheet } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';


const Icon = ({ size, style, tone, ...props }) => {
  const sizeToken =
    size === 'xl'
      ? '$iconSizeTitle'
      : size === 'l'
        ? '$iconSizeSubtitle'
        : size === 'm'
          ? '$iconSize'
          : size === 's'
            ? '$iconSizeCaption'
            : size === 'xs'
              ? '$iconSizeSmall'
              : null;

  const resolvedSize =
    typeof size === 'number'
      ? size
      : sizeToken
        ? StyleSheet.value(sizeToken)
        : StyleSheet.value('$iconSize');

  const flattenedStyle = RNStyleSheet.flatten(style) || {};
  const toneColor =
    tone === 'primary'
      ? StyleSheet.value('$colorContent')
      : tone === 'secondary' || tone === 'muted'
        ? StyleSheet.value('$colorContentLight')
        : tone === 'accent'
          ? StyleSheet.value('$colorAccent')
          : tone === 'danger'
            ? StyleSheet.value('$colorError')
            : tone === 'warning'
              ? StyleSheet.value('$colorWarning')
              : tone === 'inverse'
                ? StyleSheet.value('$colorBase')
                : undefined;
  const resolvedColor = flattenedStyle.color || toneColor || StyleSheet.value('$colorContent');

  return <MaterialCommunityIcons {...props} color={resolvedColor} size={resolvedSize} style={style} />;
};

export default Icon;
