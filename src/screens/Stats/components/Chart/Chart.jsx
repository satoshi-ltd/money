import { Text, View } from '@satoshi-ltd/nano-design';
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
  pointerIndex,
  title,
  values = [],
  onPointerChange,
  style: styleContainer,
}) => {
  const [color1, color2] = multipleData ? color : [color];
  const [data1 = [], data2 = []] = multipleData ? values : [values];
  const { width } = useWindowDimensions();

  // eslint-disable-next-line react/prop-types
  const Scale = ({ color, dataSource }) => (
    <View row style={[style.scale, multipleData && style.multiScale]}>
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
      <Text bold secondary subtitle style={style.title}>
        {title}
      </Text>

      <Scale color={color1} dataSource={data1} />

      <LineChart
        {...{ currency, color, multipleData, values, onPointerChange }}
        height={128}
        isAnimated={false}
        pointerConfig={{
          initialPointerIndex: data1.length ? pointerIndex : undefined,
          persistPointer: true,
        }}
        showPointer
        width={width - StyleSheet.value('$viewOffset') * 2}
      />

      {multipleData && <Scale color={color2} dataSource={data2} />}
    </View>
  );
};

Chart.propTypes = {
  color: PropTypes.any,
  currency: PropTypes.string,
  multipleData: PropTypes.bool,
  pointerIndex: PropTypes.number,
  title: PropTypes.string,
  values: PropTypes.any,
  onPointerChange: PropTypes.func,
  style: PropTypes.any,
};

export { Chart };
