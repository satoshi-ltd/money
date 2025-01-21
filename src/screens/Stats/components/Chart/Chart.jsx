import { Text, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React from 'react';
import { useWindowDimensions } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

import { style } from './Chart.style';
import { LineChart, PriceFriendly } from '../../../../components';
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

  const priceProps = { bold: true, color: color1, currency, fixed: 0, tiny: true };
  return (
    <View offset style={styleContainer}>
      <Text bold secondary subtitle style={style.title}>
        {title}
      </Text>

      <View row style={style.scale}>
        {Object.entries(calcScales(data1)).map(([key, value]) => (
          <PriceFriendly key={key} {...priceProps} label={key} value={value} />
        ))}
      </View>

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

      {multipleData && (
        <View row style={style.scale}>
          {Object.entries(calcScales(data2)).map(([key, value]) => (
            <PriceFriendly key={key} {...priceProps} color={color2} label={key} value={value} />
          ))}
        </View>
      )}
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
