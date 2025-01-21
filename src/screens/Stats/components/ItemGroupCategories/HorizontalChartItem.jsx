import { Card, Icon, Text, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React from 'react';
import { Dimensions } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

import { style } from './HorizontalChartItem.style';
import { PriceFriendly } from '../../../../components';

const screen = Dimensions.get('window');

const HorizontalChartItem = ({ color, currency, detail, icon, title, value, width = 0 }) => {
  const textProps = {
    bold: !detail,
    caption: !detail,
    color: detail ? 'contentLight' : 'content',
    tiny: detail,
  };

  return (
    <>
      {!detail && (
        <View
          style={[
            style.bar,
            color ? { backgroundColor: color, opacity: 0.33 } : undefined,
            { width: ((screen.width - StyleSheet.value('$viewOffset') * 2) * width) / 100 },
          ]}
        />
      )}

      <View row style={[style.content, detail && style.detail]}>
        <Icon name={icon} />
        <View flex>
          <Text {...textProps}>{title}</Text>
        </View>
        <PriceFriendly {...textProps} currency={currency} fixed={0} value={value} />
      </View>
    </>
  );
};

HorizontalChartItem.propTypes = {
  color: PropTypes.string,
  currency: PropTypes.string,
  detail: PropTypes.bool,
  icon: PropTypes.string,
  title: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  width: PropTypes.number,
};

export { HorizontalChartItem };
