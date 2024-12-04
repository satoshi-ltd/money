import { Card, Icon, Text, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React from 'react';
import { Dimensions } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

import { style } from './HorizontalChartItem.style';
import { PriceFriendly } from '../../../../components';
import { L10N } from '../../../../modules';

const screen = Dimensions.get('window');

const HorizontalChartItem = ({ amount, currency, detail, highlight, icon, title, value, width = 100 }) => (
  <>
    {!detail && (
      <View
        style={[
          style.bar,
          highlight && style.highlight,
          { width: ((screen.width - StyleSheet.value('$spaceM') * 2) * width) / 100 },
        ]}
      />
    )}

    <View row style={[style.content, detail && style.detail]}>
      {icon && (
        <Card align="center" small style={[style.cardIcon, highlight && style.highlight]}>
          <Icon name={icon} />
        </Card>
      )}
      <View flex>
        <Text bold={!detail} caption={detail} color={detail ? 'contentLight' : undefined}>
          {title}
        </Text>
        {amount && (
          <Text caption style={style.amount}>
            {L10N.CATEGORIES_AMOUNT(amount)}
          </Text>
        )}
      </View>
      <PriceFriendly
        bold
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
  amount: PropTypes.number,
  currency: PropTypes.string,
  detail: PropTypes.bool,
  highlight: PropTypes.bool,
  icon: PropTypes.string,
  title: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  width: PropTypes.number,
};

export { HorizontalChartItem };
