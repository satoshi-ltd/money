import PropTypes from 'prop-types';
import React, { useMemo, useRef, useState } from 'react';
import { useScrollToTop } from '@react-navigation/native';

import { getStyles } from './Accounts.style';
import { filter, query } from './modules';
import {
  EmptyState,
  Eyebrow,
  Heading,
  IconButton,
  Masthead,
  Pressable,
  PriceFriendly,
  Screen,
  SegmentedToggle,
  Text,
  View,
} from '../../components';
import { useApp, useStore } from '../../contexts';
import { ICON, L10N, netWorthEyebrow, percentText, rankInk } from '../../modules';

const ALL = 'all';
const SEGMENT_LIMIT = 3;

const Accounts = ({ navigation: { navigate } = {} }) => {
  const { accounts = [], overall = {}, settings: { baseCurrency } = {} } = useStore();
  const { colors } = useApp();
  const style = useMemo(() => getStyles(colors), [colors]);
  const scrollRef = useRef(null);
  useScrollToTop(scrollRef);

  const [selected, setSelected] = useState();

  const currencies = useMemo(() => query(accounts), [accounts]);
  const visible = useMemo(() => filter(accounts, selected), [accounts, selected]);

  const distribution = useMemo(() => {
    const funded = currencies.filter(({ base }) => base > 0);
    const total = funded.reduce((sum, { base }) => sum + base, 0);
    if (total <= 0) return [];

    const ordered = [...funded].sort((a, b) => b.base - a.base);
    const leads = ordered.slice(0, SEGMENT_LIMIT);
    const rest = ordered.slice(SEGMENT_LIMIT);

    const segments = leads.map(({ base, currency }, index) => ({
      color: rankInk(colors, index),
      currency,
      percentage: Math.round((base * 100) / total),
    }));

    if (rest.length) {
      const amount = rest.reduce((sum, { base }) => sum + base, 0);
      segments.push({
        color: colors.textMuted,
        currency: L10N.OTHERS,
        percentage: Math.round((amount * 100) / total),
      });
    }

    return segments;
  }, [colors, currencies]);

  const totals = visible.reduce(
    (memo, { currentBalance = 0, currentBalanceBase = 0 }) => ({
      amount: memo.amount + (selected ? currentBalance : currentBalanceBase),
      base: memo.base + currentBalanceBase,
    }),
    { amount: 0, base: 0 },
  );
  const showTotalBase = Boolean(selected) && selected !== baseCurrency;

  if (accounts.length === 0)
    return (
      <>
        <Masthead section={L10N.ACCOUNTS} />
        <Screen ref={scrollRef} style={[style.screen, style.empty]}>
          <EmptyState
            action={L10N.EMPTY_ACCOUNTS_ACTION}
            caption={L10N.EMPTY_ACCOUNTS_CAPTION}
            icon={ICON.ACCOUNTS}
            title={L10N.EMPTY_ACCOUNTS}
            onAction={() => navigate('account', { create: true })}
          />
        </Screen>
      </>
    );

  return (
    <>
      <Masthead section={L10N.ACCOUNTS}>
        <IconButton icon={ICON.ADD} onPress={() => navigate('account', { create: true })} />
      </Masthead>
      <Screen ref={scrollRef} style={style.screen}>
        <View style={style.hero}>
          <Eyebrow>{netWorthEyebrow({ accounts: accounts.length, currency: baseCurrency })}</Eyebrow>
          <PriceFriendly
            bold
            currency={baseCurrency}
            size="hero"
            style={style.heroValue}
            value={overall?.currentBalance || 0}
          />
        </View>

        {distribution.length > 1 ? (
          <View style={style.distribution}>
            <View row style={style.bar}>
              {distribution.map(({ color, currency, percentage }) => (
                <View key={currency} style={{ backgroundColor: color, flexGrow: percentage }} />
              ))}
            </View>
            <View row style={style.legend}>
              {distribution.map(({ color, currency, percentage }) => (
                <View key={currency} row style={style.legendItem}>
                  <View style={[style.dot, { backgroundColor: color }]} />
                  <Text
                    medium={currency === baseCurrency}
                    size="xxs"
                    tone={currency === baseCurrency ? undefined : 'muted'}
                  >
                    {currency}
                  </Text>
                  <Text figure="xs" tone="muted">
                    {percentText(percentage)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {currencies.length > 1 ? (
          <View style={style.toolbar}>
            <SegmentedToggle
              scrollable
              options={[
                { label: L10N.ALL, value: ALL },
                ...currencies.map(({ currency }) => ({ label: currency, value: currency })),
              ]}
              value={selected || ALL}
              onChange={(value) => setSelected(value === ALL ? undefined : value)}
            />
          </View>
        ) : null}

        <View style={style.section}>
          <Heading eyebrow={`${visible.length}`} value={L10N.ACCOUNTS} />

          {visible.map((account) => {
            const { currency, currentBalance = 0, currentBalanceBase = 0, hash, title } = account;
            const showBase = baseCurrency && currency !== baseCurrency;

            return (
              <Pressable key={hash} onPress={() => navigate('transactions', { account })}>
                <View row style={style.accountRow}>
                  <View flex style={style.accountText}>
                    <Text medium numberOfLines={1}>
                      {title}
                    </Text>
                    <Text size="xxs" tone="muted">
                      {currency}
                    </Text>
                  </View>
                  <View style={style.accountRight}>
                    <PriceFriendly bold currency={currency} showSymbol size="lg" value={currentBalance} />
                    <View row style={style.accountMeta}>
                      {showBase ? (
                        <PriceFriendly
                          currency={baseCurrency}
                          showSymbol
                          size="xs"
                          tone="muted"
                          value={currentBalanceBase}
                        />
                      ) : null}
                    </View>
                  </View>
                </View>
              </Pressable>
            );
          })}

          <View row spaceBetween style={style.totalRow}>
            <Eyebrow>{L10N.TOTAL}</Eyebrow>
            <View style={style.accountRight}>
              <PriceFriendly bold currency={selected || baseCurrency} showSymbol size="lg" value={totals.amount} />
              <View row style={style.accountMeta}>
                {showTotalBase ? (
                  <PriceFriendly currency={baseCurrency} showSymbol size="xs" tone="muted" value={totals.base} />
                ) : null}
              </View>
            </View>
          </View>
        </View>
      </Screen>
    </>
  );
};

Accounts.displayName = 'Accounts';

Accounts.propTypes = {
  navigation: PropTypes.any,
};

export { Accounts };
