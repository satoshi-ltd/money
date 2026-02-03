import { Heading, Text, View } from '../../../../components';
import PropTypes from 'prop-types';
import React from 'react';
import { useWindowDimensions } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

import { style } from './Chart.style';
import { LineChart, PriceFriendly } from '../../../../components';
import { L10N } from '../../../../modules';
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
    data.map((val) => (typeof val === 'number' && !isNaN(val) ? Math.max(0, val) : val));
  const normalizedData1 = normalize(data1);
  const normalizedData2 = normalize(data2);
  const { width } = useWindowDimensions();
  const getValue = (token, fallback) =>
    StyleSheet && typeof StyleSheet.value === 'function' ? StyleSheet.value(token) : fallback;
  const viewOffset = getValue('$viewOffset', 16);

  // eslint-disable-next-line react/prop-types
  const Scale = ({ color, dataSource }) => (
    <View row style={style.scale}>
      {Object.entries(calcScales(dataSource)).map(([key, value]) => (
        <View key={key} row style={style.scale}>
          <PriceFriendly {...{ color, currency, value }} bold fixed={0} tiny label={`${L10N.SCALE_KEY[key]} `} />
          {key !== 'max' && (
            <Text tiny color={color}>
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
        isAnimated={false}
        pointerConfig={{
          initialPointerIndex: data1.length ? pointerIndex : undefined,
          persistPointer: true,
        }}
        showPointer
        width={width - viewOffset * 2}
      />

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
