import PropTypes from 'prop-types';
import React from 'react';

import { Eyebrow, Icon, Pressable, Text, View } from '../../components';
import { getLastRates } from '../../components/InputAmount/helpers';
import { C, ICON, L10N } from '../../modules';

const { CURRENCY_GROUPS, SYMBOL } = C;

const formatRate = (rate) => rate.toLocaleString('en-US', { maximumFractionDigits: rate >= 100 ? 0 : rate >= 1 ? 2 : 4 });

const Currency = ({ onChange, rates = {}, style, value }) => {
  const latestRates = getLastRates(rates);

  return (
    <>
      <View style={[style.pad, style.stepTop]}>
        <Text bold size="xl">
          {L10N.ONB_CURRENCY_TITLE}
        </Text>
        <Text size="s" tone="secondary" style={style.caption}>
          {L10N.ONB_CURRENCY_CAPTION}
        </Text>
      </View>

      {CURRENCY_GROUPS.map(({ codes, id }, group) => (
        <View key={id} style={[style.pad, group === 0 ? style.groupFirst : style.groupOffset]}>
          <Eyebrow style={style.groupLabel}>{L10N.CURRENCY_GROUP[id] || id}</Eyebrow>

          {codes.map((item, index) => {
            const rate = latestRates[item];

            return (
              <Pressable key={item} style={[style.row, index > 0 && style.rowDivider]} onPress={() => onChange(item)}>
                <View style={style.well}>
                  <Text figure="sm">{SYMBOL[item] || item}</Text>
                </View>
                <View flex>
                  <Text medium numberOfLines={1}>
                    {item}
                  </Text>
                  <Text size="xxs" tone="muted" numberOfLines={1}>
                    {L10N.CURRENCY_NAME[item] || item}
                  </Text>
                </View>
                {value === item ? (
                  <Icon name={ICON.CHECK} tone="accent" />
                ) : Number.isFinite(rate) ? (
                  <Text figure="xs" tone="muted">
                    {formatRate(rate)}
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      ))}
    </>
  );
};

Currency.propTypes = {
  onChange: PropTypes.func.isRequired,
  rates: PropTypes.object,
  style: PropTypes.object.isRequired,
  value: PropTypes.string,
};

export { Currency };
