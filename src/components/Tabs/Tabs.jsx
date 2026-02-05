import React, { useMemo } from 'react';

import { getStyles } from './Tabs.styles';
import { useApp } from '../../contexts';
import { Pressable, Text, View } from '../../primitives';

const Tabs = ({ accent, caption, onChange, options = [], selected = 0, style }) => {
  const selectedId = typeof selected === 'number' ? options[selected]?.id : selected;
  const { colors } = useApp();
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <View row style={[styles.container, style]}>
      {options.map((option, index) => {
        const isActive = selectedId ? option.id === selectedId : index === selected;
        const activeStyle = accent ? styles.activeAlt : styles.active;
        const activeTone = accent ? 'inverse' : 'primary';

        return (
          <Pressable
            key={option.id || option.text || index}
            onPress={() => onChange?.(option, index)}
            style={[styles.tab, isActive && activeStyle]}
          >
            <Text bold size={caption ? 's' : 'm'} tone={isActive ? activeTone : 'primary'}>
              {option.text}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

export default Tabs;
