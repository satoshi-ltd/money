import React from 'react';

import { Pressable, Text, View } from '../../primitives';
import { resolveColor } from '../utils/resolveColor';
import { styles } from './Tabs.styles';

const Tabs = ({ accent, caption, onChange, options = [], selected = 0, style }) => {
  const selectedId = typeof selected === 'number' ? options[selected]?.id : selected;

  return (
    <View row style={[styles.container, style]}>
      {options.map((option, index) => {
        const isActive = selectedId ? option.id === selectedId : index === selected;
        const activeStyle = accent ? styles.activeAlt : styles.active;
        const textColor = accent ? resolveColor('base') : resolveColor('content');

        return (
          <Pressable
            key={option.id || option.text || index}
            onPress={() => onChange?.(option, index)}
            style={[styles.tab, isActive && activeStyle]}
          >
            <Text bold size={caption ? 's' : 'm'} color={isActive ? textColor : 'content'}>
              {option.text}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

export default Tabs;
