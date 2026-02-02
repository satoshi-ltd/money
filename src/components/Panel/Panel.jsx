import React from 'react';
import StyleSheet from 'react-native-extended-stylesheet';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '../../contexts';
import Header from '../Header';
import Screen from '../Screen';

const Panel = ({
  children,
  title,
  onBack,
  leftElement,
  rightElement,
  showBorder = false,
  transparent = false,
  disableScroll = false,
  style,
  ...props
}) => {
  const { bottom } = useSafeAreaInsets();
  const { colors } = useApp();
  const paddingBottom = StyleSheet.value('$viewOffset') + bottom;
  const showHeader = title !== undefined || onBack || leftElement || rightElement;
  const baseColor = colors.background;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: baseColor }}>
      {showHeader ? (
        <Header
          title={title ?? ''}
          onBack={onBack}
          leftElement={leftElement}
          rightElement={rightElement}
          showBorder={showBorder}
          transparent={transparent}
          style={!transparent ? { backgroundColor: baseColor } : null}
        />
      ) : null}
      <Screen
        disableScroll={disableScroll}
        {...props}
        style={[style, { paddingBottom }]}
      >
        {children}
      </Screen>
    </SafeAreaView>
  );
};

export default Panel;
