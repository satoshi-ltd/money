import PropTypes from 'prop-types';
import React from 'react';

import { FieldRow, Icon, Input, Text, View } from '../../components';
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
      <FieldRow label={L10N.NAME}>
        <Input placeholder="…" style={style.rowInput} value={title} onChange={onTitle} />
      </FieldRow>

      <FieldRow chevron divider label={L10N.CURRENCY} onPress={onCurrency}>
        <Text medium numberOfLines={1} size="s">
          {`${currency} · ${L10N.CURRENCY_NAME[currency] || currency}`}
        </Text>
      </FieldRow>

      <FieldRow divider label={L10N.BALANCE}>
        <Input
          keyboardType="decimal-pad"
          placeholder="0"
          style={style.rowFigure}
          value={balance}
          onChange={onBalance}
        />
        <Text figure="sm" tone="muted">
          {SYMBOL[currency] || currency}
        </Text>
      </FieldRow>
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
