import PropTypes from 'prop-types';
import React from 'react';

import { ChartHeading } from './Chart.Heading';
import { style } from './Chart.style';
import { calcHeight } from './helpers';
import { Text, View } from '../../../../../__design-system__';
import { PriceFriendly } from '../../../../../components';

const Chart = ({
  captions,
  color = 'contentLight',
  highlight,
  inverted,
  values = [],
  style: styleContainer,
  ...others
}) => {
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
              <View style={style.scaleLine} />
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
                  style[color],
                  value !== 0 && {
                    height: `${calcHeight(value, { min, max })}%`,
                  },
                  {
                    opacity: highlight !== index ? 0.5 : 1,
                  },
                ]}
              />
            </View>
          ))}
        </View>
      </View>

      {inverted && <ChartHeading {...others} />}

      {captions && (
        <View style={[style.offset, style.captions]}>
          {captions.map((caption, index) => (
            <Text
              bold={highlight === index}
              color={highlight === index ? 'accent' : 'contentLight'}
              key={`${caption}-${index}`}
              tiny
            >
              {caption.substring(0, 3)}
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
