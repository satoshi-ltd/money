import PropTypes from 'prop-types';
import React from 'react';

import { Icon, Input, Pressable, Text, View } from '../../components';
import { C, ICON, L10N } from '../../modules';

const { SYMBOL } = C;

const Account = ({ balance, currency, onBalance, onCurrency, onTitle, style, title }) => (
  <>
    <View style={[style.pad, style.stepTop]}>
      <Text bold size="xl">
        {L10N.ONB_ACCOUNT_TITLE}
      </Text>
      <Text size="s" tone="secondary" style={style.caption}>
        {L10N.ONB_ACCOUNT_CAPTION}
      </Text>
    </View>

    <View style={[style.pad, style.fields]}>
      <View style={style.rule} />

      <View row style={style.field}>
        <Text size="s" tone="muted" style={style.fieldKey}>
          {L10N.NAME}
        </Text>
        <Input placeholder="…" style={style.fieldInput} value={title} onChange={onTitle} />
      </View>

      <Pressable style={[style.field, style.rowDivider, style.fieldRow]} onPress={onCurrency}>
        <Text size="s" tone="muted" style={style.fieldKey}>
          {L10N.CURRENCY}
        </Text>
        <Text medium style={style.fieldValue}>
          {`${currency} · ${L10N.CURRENCY_NAME[currency] || currency}`}
        </Text>
        <Icon name={ICON.RIGHT} size="xs" tone="muted" />
      </Pressable>

      <View row style={[style.field, style.rowDivider]}>
        <Text size="s" tone="muted" style={style.fieldKey}>
          {L10N.ONB_OPENING_BALANCE}
        </Text>
        <Input
          keyboardType="decimal-pad"
          placeholder="0"
          style={[style.fieldInput, style.fieldFigure]}
          value={balance}
          onChange={onBalance}
        />
        <Text figure="sm" tone="muted">
          {SYMBOL[currency] || currency}
        </Text>
      </View>

      <View style={style.rule} />
    </View>

    <View row style={[style.pad, style.note, style.noteOffset]}>
      <Icon name={ICON.INFO} size="xs" tone="muted" />
      <Text flex size="xs" tone="muted">
        {L10N.ONB_ACCOUNT_NOTE}
      </Text>
    </View>
  </>
);

Account.propTypes = {
  balance: PropTypes.string,
  currency: PropTypes.string.isRequired,
  onBalance: PropTypes.func.isRequired,
  onCurrency: PropTypes.func.isRequired,
  onTitle: PropTypes.func.isRequired,
  style: PropTypes.object.isRequired,
  title: PropTypes.string,
};

export { Account };
