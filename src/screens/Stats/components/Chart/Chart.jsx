import { Text, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React from 'react';
import StyleSheet from 'react-native-extended-stylesheet';

import { ChartHeading } from './Chart.Heading';
import { style } from './Chart.style';
import { calcHeight } from './helpers';
import { PriceFriendly } from '../../../../components';

const Chart = ({ captions, color = 'content', highlight, inverted, values = [], style: styleContainer, ...others }) => {
  const { currency, max, min, med: avg } = others;
  let firstValueIndex = values.findIndex((value) => value !== 0);
  if (firstValueIndex === -1) firstValueIndex = undefined;

  return (
    <View style={styleContainer}>
      {!inverted && <ChartHeading color={color} {...others} />}

      <View style={[style.offset, !inverted && style.border]}>
        {avg > 0 && (
          <View style={style.scales}>
            <View
              style={[
                style.scaleAvg,
                { top: inverted ? `${calcHeight(avg, { min, max })}%` : `${100 - calcHeight(avg, { min, max })}%` },
              ]}
            >
              <View
                style={[style.scaleLine, color === 'accent' && { borderColor: StyleSheet.value('$colorAccent') }]}
              />
              <View style={[style.tag, style.scaleBorder, style[color]]}>
                <PriceFriendly
                  bold
                  color={color !== 'accent' ? 'base' : undefined}
                  currency={currency}
                  fixed={0}
                  tiny
                  value={avg}
                />
              </View>
            </View>
          </View>
        )}

        <View style={style.bars}>
          {values.map((value, index) => (
            <View key={`${value}-${index.toString()}`} style={[style.column, inverted && style.columnInverted]}>
              <View
                style={[
                  style.bar,
                  inverted && style.barInverted,
                  color === 'accent' || highlight === index ? style[color] : undefined,
                  color === 'accent' && { opacity: highlight !== index ? 0.33 : 1 },
                  value !== 0 && { height: `${calcHeight(value, { min, max })}%` },
                ]}
              />
            </View>
          ))}
        </View>
      </View>

      {inverted && <ChartHeading {...others} style={style.chartHeadingInverted} />}

      {captions && (
        <View style={[style.offset, style.captions]}>
          {captions.map((caption, index) => (
            <Text
              align="center"
              bold={highlight === index}
              color={highlight === index ? 'content' : 'contentLight'}
              key={`${caption}-${index}`}
              tiny
              style={style.caption}
            >
              {caption.substring(0, 3).toUpperCase()}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};

Chart.propTypes = {
  captions: PropTypes.arrayOf(PropTypes.string),
  color: PropTypes.string,
  currency: PropTypes.string,
  highlight: PropTypes.number,
  inverted: PropTypes.bool,
  style: PropTypes.any,
  title: PropTypes.string,
  values: PropTypes.arrayOf(PropTypes.number),
};

export { Chart };
