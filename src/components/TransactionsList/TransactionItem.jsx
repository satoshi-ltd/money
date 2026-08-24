import { useNavigation } from '@react-navigation/native';
import PropTypes from 'prop-types';
import React, { useMemo, useRef } from 'react';
import { Swipeable } from 'react-native-gesture-handler';

import { getStyles } from './TransactionsList.style';
import { useApp, useStore } from '../../contexts';
import { C, eventEmitter, exchange, L10N, verboseTime } from '../../modules';
import { Pressable, Text, View } from '../../primitives';
import { PriceFriendly } from '../PriceFriendly';

const {
  EVENT,
  TX: {
    TYPE: { EXPENSE },
  },
  INTERNAL_TRANSFER,
} = C;

const TransactionItem = ({
  category = INTERNAL_TRANSFER,
  currency,
  timestamp,
  title,
  type = EXPENSE,
  value = 0,
  ...others
}) => {
  const { navigate } = useNavigation();
  const { colors } = useApp();
  const style = useMemo(() => getStyles(colors), [colors]);
  const {
    deleteTx,
    settings: { baseCurrency },
    rates,
  } = useStore();
  const swipeableRef = useRef();

  const signed = type === EXPENSE ? -Math.abs(value) : Math.abs(value);
  const valueBase = baseCurrency !== currency ? exchange(signed, currency, baseCurrency, rates, timestamp) : undefined;

  const handlePress = () => {
    navigate('clone', { ...others, category, currency, timestamp, title, type, value });
  };

  const handleEdit = () => {
    swipeableRef.current?.close();
    handlePress();
  };

  const handleDelete = () => {
    swipeableRef.current?.close();
    eventEmitter.emit(EVENT.CONFIRM, {
      title: L10N.CONFIRM_DELETION,
      caption: L10N.CONFIRM_DELETION_CAPTION,
      actionLabel: L10N.DELETE,
      onAction: () => deleteTx?.({ hash: others.hash }),
    });
  };

  const renderRightActions = () => (
    <View style={style.swipeActions}>
      <Pressable
        testID="tx-swipe-edit"
        onPress={handleEdit}
        style={[style.swipeAction, { backgroundColor: colors.surface }]}
      >
        <Text size="xs" tone="secondary">
          {L10N.EDIT}
        </Text>
      </Pressable>
      <Pressable
        testID="tx-swipe-delete"
        onPress={handleDelete}
        style={[style.swipeAction, { backgroundColor: colors.dangerSoft }]}
      >
        <Text size="xs" tone="danger">
          {L10N.DELETE}
        </Text>
      </Pressable>
    </View>
  );

  return (
    <Swipeable ref={swipeableRef} friction={2} overshootRight={false} renderRightActions={renderRightActions}>
      <Pressable onPress={handlePress}>
        <View row style={style.row}>
          <Text figure="xs" style={style.time} tone="muted">
            {verboseTime(new Date(timestamp))}
          </Text>

          <View flex style={style.text}>
            <Text medium numberOfLines={1}>
              {title}
            </Text>
            <Text numberOfLines={1} size="xxs" tone="muted">
              {L10N.CATEGORIES[type][category]}
            </Text>
          </View>

          <View style={style.amount}>
            <PriceFriendly
              bold
              currency={currency}
              operator={type !== EXPENSE}
              showSymbol={baseCurrency !== currency}
              size="md"
              value={signed}
            />
            {Number.isFinite(valueBase) ? (
              <PriceFriendly currency={baseCurrency} showSymbol size="xs" tone="muted" value={valueBase} />
            ) : null}
          </View>
        </View>
      </Pressable>
    </Swipeable>
  );
};

TransactionItem.propTypes = {
  category: PropTypes.number,
  currency: PropTypes.string.isRequired,
  timestamp: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  title: PropTypes.string,
  type: PropTypes.number,
  value: PropTypes.number,
};

export { TransactionItem };
