import { Button, Pagination, ScrollView, Text, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React, { useRef, useState } from 'react';
import { SafeAreaView, useWindowDimensions } from 'react-native';
import { Image } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

import { IMAGE_SIZE, SLIDES } from './Onboarding.constants';
import { style } from './Onboarding.style';
import { useStore } from '../../contexts';
import { L10N } from '../../modules';

const Onboarding = ({ navigation: { navigate } }) => {
  const scrollview = useRef(null);
  const { updateSettings } = useStore();
  const { width } = useWindowDimensions();

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (event) => {
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / event.nativeEvent.layoutMeasurement.width);
    setCurrentIndex(index);
  };

  const handleNext = async () => {
    if (lastSlide) {
      await updateSettings({ onboarded: true });
      navigate('session');
    } else if (scrollview.current) {
      scrollview.current.scrollTo({ x: width * (currentIndex + 1), animated: true });
    }
  };

  const spaceXL = StyleSheet.value('$spaceXL');
  const lastSlide = currentIndex === SLIDES.length - 1;
  const slideSize = width - spaceXL * 2;

  return (
    <SafeAreaView style={style.screen}>
      <ScrollView horizontal ref={scrollview} snap={width} onScroll={handleScroll}>
        {SLIDES.map(({ image, message, title }, index) => (
          <View key={index} style={[style.slide, { width }]}>
            <Image
              resizeMode="contain"
              source={image}
              style={[style.image, slideSize <= IMAGE_SIZE ? { height: slideSize * 1.2, width: slideSize } : undefined]}
            />
            <Text bold title>
              {title}
            </Text>
            <Text color="contentLight">{message}</Text>
          </View>
        ))}
      </ScrollView>

      <View row style={style.footer}>
        <Pagination currentIndex={currentIndex} length={SLIDES.length} />

        <Button onPress={handleNext} style={style.button}>
          {lastSlide ? L10N.START : L10N.NEXT}
        </Button>
      </View>
    </SafeAreaView>
  );
};

Onboarding.propTypes = {
  navigation: PropTypes.any,
};

export { Onboarding };
