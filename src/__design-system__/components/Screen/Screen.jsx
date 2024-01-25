import { useFocusEffect } from '@react-navigation/native';
import PropTypes from 'prop-types';
import React, { useCallback, useRef } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';

import { style } from './Screen.style';
import { ScrollView, View } from '../../primitives';

const Screen = ({ modal = false, refreshScroll = true, ...others }) => {
  const scrollview = useRef(null);

  useFocusEffect(
    useCallback(() => {
      if (refreshScroll) scrollview.current?.scrollTo({ y: 0, animated: false });
      return () => {};
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  return (
    <SafeAreaView style={style.safeAreaView}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'position' : 'height'}>
        <ScrollView ref={scrollview} style={style.scrollView}>
          <View {...others} style={[modal ? style.modal : undefined, others.style]} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

Screen.displayName = 'Screen';

Screen.propTypes = {
  children: PropTypes.node,
  modal: PropTypes.bool,
  refreshScroll: PropTypes.bool,
};

export { Screen };
