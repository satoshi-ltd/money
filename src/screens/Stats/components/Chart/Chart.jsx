import PropTypes from 'prop-types';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, useWindowDimensions } from 'react-native';

import { style } from './Chart.style';
import { Heading, Text, View } from '../../../../components';
import { LineChart, PriceFriendly } from '../../../../components';
import { L10N } from '../../../../modules';
import { viewOffset } from '../../../../theme/layout';
import { calcScales } from '../../modules';

const Chart = ({
  color,
  currency,
  multipleData,
  headingRight,
  monthsLimit,
  pointerIndex,
  title,
  values = [],
  onPointerChange,
  style: styleContainer,
}) => {
  const [color1, color2] = multipleData ? color : [color];
  const [data1 = [], data2 = []] = multipleData ? values : [values];
  const normalize = (data = []) =>
    data.filter((val) => typeof val === 'number' && !isNaN(val)).map((val) => Math.max(0, val));
  const normalizedData1 = normalize(data1);
  const normalizedData2 = normalize(data2);
  const { width } = useWindowDimensions();
  const chartWidth = width - viewOffset * 2;

  // Gifted-charts `isAnimated` can be visually flaky here; keep charts static and animate a safe reveal.
  const reveal = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    reveal.stopAnimation();
    reveal.setValue(0);
    Animated.timing(reveal, {
      toValue: chartWidth,
      duration: 450,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [chartWidth, monthsLimit, multipleData, normalizedData1.length, normalizedData2.length, reveal]);

  // eslint-disable-next-line react/prop-types
  const Scale = ({ color, dataSource }) => (
    <View row style={style.scale}>
      {Object.entries(calcScales(dataSource)).map(([key, value]) => (
        <View key={key} row style={style.scale}>
          <PriceFriendly {...{ color, currency, value }} bold fixed={0} size="xs" label={`${L10N.SCALE_KEY[key]} `} />
          {key !== 'max' && (
            <Text tone="secondary" size="xs">
              |
            </Text>
          )}
        </View>
      ))}
    </View>
  );

  return (
    <View offset style={styleContainer}>
      <Heading value={title}>{headingRight}</Heading>

      <Scale color={color1} dataSource={normalizedData1} />

      <Animated.View style={{ width: reveal, overflow: 'hidden' }}>
        <LineChart
          {...{
            currency,
            color,
            multipleData,
            monthsLimit,
            values: multipleData ? [normalizedData1, normalizedData2] : normalizedData1,
            onPointerChange,
          }}
          height={128}
          pointerConfig={{
            initialPointerIndex: data1.length ? pointerIndex : undefined,
            persistPointer: true,
          }}
          showPointer
          width={chartWidth}
        />
      </Animated.View>

      {multipleData && <Scale color={color2} dataSource={normalizedData2} />}
    </View>
  );
};

Chart.propTypes = {
  color: PropTypes.any,
  currency: PropTypes.string,
  multipleData: PropTypes.bool,
  headingRight: PropTypes.node,
  monthsLimit: PropTypes.number,
  pointerIndex: PropTypes.number,
  title: PropTypes.string,
  values: PropTypes.any,
  onPointerChange: PropTypes.func,
  style: PropTypes.any,
};

export { Chart };
