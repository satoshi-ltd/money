import PropTypes from 'prop-types';
import React, { useState } from 'react';

import { Icon, Input, Pressable, Text, View } from '../../components';
import { getLastRates } from '../../components/InputAmount/helpers';
import { C, ICON, L10N } from '../../modules';

const { SYMBOL } = C;

const formatRate = (rate) => rate.toLocaleString('en-US', { maximumFractionDigits: rate >= 100 ? 0 : rate >= 1 ? 2 : 4 });

const Currency = ({ onChange, rates = {}, style, value }) => {
  const [query, setQuery] = useState('');

  const latestRates = getLastRates(rates);
  const needle = query.trim().toLowerCase();
  const currencies = Object.keys(SYMBOL).filter(
    (item) => !needle || item.toLowerCase().includes(needle) || `${L10N.CURRENCY_NAME[item] || ''}`.toLowerCase().includes(needle),
  );

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

      <View style={[style.pad, style.searchOffset]}>
        <View row style={style.search}>
          <Icon name={ICON.SEARCH} size="s" tone="muted" />
          <Input
            placeholder={L10N.ONB_CURRENCY_SEARCH}
            style={style.searchInput}
            value={query}
            onChange={setQuery}
          />
        </View>
      </View>

      <View style={style.pad}>
        {currencies.map((item, index) => {
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
