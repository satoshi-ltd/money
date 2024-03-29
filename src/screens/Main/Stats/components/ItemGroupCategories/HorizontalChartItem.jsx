import { Icon, Text, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React from 'react';
import { Dimensions } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

import { style } from './HorizontalChartItem.style';
import { PriceFriendly } from '../../../../../components';

const screen = Dimensions.get('window');

const HorizontalChartItem = ({ currency, detail, highlight, icon, title, value, width = 100 }) => (
  <>
    {!detail && (
      <View
        style={[
          style.container,
          highlight && style.highlight,
          { width: ((screen.width - StyleSheet.value('$spaceM') * 2) * width) / 100 },
        ]}
      />
    )}

    <View style={[style.content, detail && style.detail]}>
      {icon && <Icon name={icon} />}
      <Text bold={!detail} caption={detail} color={detail ? 'contentLight' : undefined} style={style.title}>
        {title}
      </Text>
      <PriceFriendly
        bold={!detail}
        caption
        color={detail ? 'contentLight' : undefined}
        currency={currency}
        fixed={0}
        value={value}
      />
    </View>
  </>
);

HorizontalChartItem.propTypes = {
  currency: PropTypes.string,
  detail: PropTypes.bool,
  highlight: PropTypes.bool,
  icon: PropTypes.string,
  title: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  width: PropTypes.number,
};

export { HorizontalChartItem };
