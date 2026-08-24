import DateTimePicker from '@react-native-community/datetimepicker';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';

import { getStyles } from './ScheduledForm.style';
import {
  Button,
  Dropdown,
  Eyebrow,
  FieldRow,
  Input,
  Modal,
  Panel,
  Pressable,
  SegmentedToggle,
  Text,
  View,
} from '../../components';
import { useApp, useStore } from '../../contexts';
import { C, currencySymbol, eventEmitter, getNextOccurrenceAt, L10N, verboseDate } from '../../modules';
import { queryCategories } from '../Transaction/helpers/queryCategories';

const isNumber = /^[0-9]+([,.][0-9]+)?$|^[0-9]+([,.][0-9]+)?[.,]$/;

const {
  TX: {
    TYPE: { EXPENSE, INCOME },
  },
} = C;

const weekdayLabel = (day, language) =>
  new Intl.DateTimeFormat(language || 'en', { weekday: 'short' }).format(new Date(2023, 0, 1 + Number(day)));

const weekdayInitial = (day, language) => weekdayLabel(day, language).charAt(0).toUpperCase();

const ScheduledForm = ({ navigation = {}, route = {} }) => {
  const { goBack } = navigation;
  const { params: { id } = {} } = route;
  const { colors, language } = useApp();
  const style = useMemo(() => getStyles(colors), [colors]);
  const { settings: { theme: themeMode } = {}, session: { locale } = {} } = useStore();

  const { accounts = [], scheduledTxs = [], createScheduled, deleteScheduled, updateScheduled } = useStore();

  const existing = useMemo(() => (id ? scheduledTxs.find((r) => r.id === id) : undefined), [id, scheduledTxs]);

  const [account, setAccount] = useState(existing?.account || accounts?.[0]?.hash);
  const [type, setType] = useState(existing?.type ?? EXPENSE);
  const [category, setCategory] = useState(existing?.category);
  const [title, setTitle] = useState(existing?.title || '');
  const [value, setValue] = useState(existing?.value || 0);
  const [startAt, setStartAt] = useState(existing?.startAt || Date.now());
  const [kind, setKind] = useState(existing?.pattern?.kind || 'weekly');
  const [byWeekday, setByWeekday] = useState(
    existing?.pattern?.byWeekday || [new Date(existing?.startAt || Date.now()).getDay()],
  );
  const [byMonthDay, setByMonthDay] = useState(
    existing?.pattern?.byMonthDay || new Date(existing?.startAt || Date.now()).getDate(),
  );

  useEffect(() => {
    if (!accounts.length) return;
    if (!account) setAccount(accounts[0].hash);
  }, [account, accounts]);

  useEffect(() => {
    if (!existing) return;
    setAccount(existing.account);
    setType(existing.type ?? EXPENSE);
    setCategory(existing.category);
    setTitle(existing.title || '');
    setValue(existing.value || 0);
    setStartAt(existing.startAt || Date.now());
    setKind(existing?.pattern?.kind || 'weekly');
    setByWeekday(existing?.pattern?.byWeekday || [new Date(existing?.startAt || Date.now()).getDay()]);
    setByMonthDay(existing?.pattern?.byMonthDay || new Date(existing?.startAt || Date.now()).getDate());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing?.id]);

  useEffect(() => {
    if (kind === 'weekly' && (!byWeekday || byWeekday.length === 0)) {
      setByWeekday([new Date(startAt).getDay()]);
    }
    if (kind === 'monthly' && !byMonthDay) setByMonthDay(new Date(startAt).getDate());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);

  const categories = useMemo(() => queryCategories({ type }), [type]);
  const [showAccounts, setShowAccounts] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [openDate, setOpenDate] = useState(false);

  const handleAmount = (raw = '') => {
    if (!isNumber.test(raw) || raw.length === 0) return setValue(undefined);
    setValue(raw.replace(',', '.'));
  };

  const typeOptions = [
    { label: L10N.EXPENSE, value: EXPENSE },
    { label: L10N.INCOME, value: INCOME },
  ];

  const kindOptions = [
    { label: L10N.SCHEDULED_PATTERN_WEEKLY, value: 'weekly' },
    { label: L10N.SCHEDULED_PATTERN_MONTHLY, value: 'monthly' },
  ];

  const currentAccount = accounts.find((a) => a.hash === account) || accounts[0];

  const valid =
    !!currentAccount?.hash &&
    Number.isFinite(Number(value)) &&
    Number(value) > 0 &&
    typeof title === 'string' &&
    title.trim() !== '' &&
    category !== undefined &&
    (kind === 'weekly' ? Array.isArray(byWeekday) && byWeekday.length > 0 : Number(byMonthDay) >= 1);

  const toggleDay = (day) => {
    const current = Array.isArray(byWeekday) ? byWeekday : [];
    const exists = current.includes(day);
    const next = exists ? current.filter((d) => d !== day) : [...current, day];
    const arr = next.slice().sort((a, b) => a - b);
    setByWeekday(arr.length ? arr : [new Date(startAt).getDay()]);
  };

  const handleSave = async () => {
    if (!valid) return;
    const payload = {
      account: currentAccount.hash,
      type,
      category,
      title: title.trim(),
      value: Number(value),
      startAt,
      pattern:
        kind === 'monthly'
          ? { kind, interval: 1, byMonthDay: Math.max(1, Math.min(31, Number(byMonthDay) || 1)) }
          : { kind, interval: 1, byWeekday: (byWeekday || []).map((d) => Number(d)) },
    };

    if (existing?.id) await updateScheduled({ id: existing.id, ...payload });
    else await createScheduled(payload);
    goBack();
  };

  const handleDelete = () => {
    if (!existing?.id) return;
    eventEmitter.emit(C.EVENT.CONFIRM, {
      title: L10N.CONFIRM_DELETION,
      caption: L10N.CONFIRM_DELETION_CAPTION,
      actionLabel: L10N.DELETE,
      onAction: async () => {
        await deleteScheduled({ id: existing.id });
        goBack();
      },
    });
  };

  const previewPattern =
    kind === 'monthly'
      ? { kind, interval: 1, byMonthDay: Math.max(1, Math.min(31, Number(byMonthDay) || 1)) }
      : { kind, interval: 1, byWeekday: (byWeekday || []).map((d) => Number(d)) };
  const previewNextAt = getNextOccurrenceAt({ scheduled: { startAt, pattern: previewPattern }, afterAt: Date.now() });
  const previewCaption =
    kind === 'monthly'
      ? L10N.SCHEDULED_CAPTION_MONTHLY({ day: Number(byMonthDay) || 1 })
      : L10N.SCHEDULED_CAPTION_WEEKLY({
          days: [...new Set((byWeekday || []).map((d) => Number(d)))]
            .sort((a, b) => a - b)
            .map((d) => weekdayLabel(d, language))
            .join(', '),
        });

  const categoryLabel = categories.find(({ key }) => key === category)?.caption;
  const accountOptions = accounts.map((item) => ({
    account: item,
    id: item.hash,
    label: item.title,
    symbol: item.currency,
  }));
  const categoryOptions = categories.map((item) => ({ id: item.key, label: item.caption }));
  const symbol = currencySymbol(currentAccount?.currency);

  return (
    <Panel offset sheet title={L10N.SCHEDULED_ONE} onBack={goBack}>
      <SegmentedToggle
        options={typeOptions}
        style={style.section}
        value={type}
        onChange={(nextValue) => setType(nextValue)}
      />

      <View style={style.group}>
        <FieldRow label={L10N.CONCEPT}>
          <Input placeholder="..." style={style.rowInput} value={title} onChange={setTitle} />
        </FieldRow>

        <FieldRow divider label={L10N.AMOUNT}>
          <Input
            keyboardType="decimal-pad"
            placeholder="0"
            style={style.rowFigure}
            value={value !== undefined && value !== null ? value.toString() : ''}
            onChange={handleAmount}
          />
          <Text figure="sm" tone="muted">
            {symbol}
          </Text>
        </FieldRow>

        <View style={[style.rowWrap, showAccounts && style.rowWrapOpen]}>
          <FieldRow chevron divider label={L10N.ACCOUNT} onPress={() => setShowAccounts(true)}>
            <Text medium numberOfLines={1} size="s">
              {currentAccount?.title}
            </Text>
          </FieldRow>
          <Dropdown
            options={accountOptions}
            selected={currentAccount?.hash}
            visible={showAccounts}
            onClose={() => setShowAccounts(false)}
            onSelect={(option) => {
              setShowAccounts(false);
              if (option?.account) setAccount(option.account.hash);
            }}
          />
        </View>

        <View style={[style.rowWrap, showCategories && style.rowWrapOpen]}>
          <FieldRow chevron divider label={L10N.CATEGORY} onPress={() => setShowCategories(true)}>
            <Text medium numberOfLines={1} size="s">
              {categoryLabel || '...'}
            </Text>
          </FieldRow>
          <Dropdown
            options={categoryOptions}
            selected={category}
            visible={showCategories}
            onClose={() => setShowCategories(false)}
            onSelect={(option) => {
              setShowCategories(false);
              setCategory(option.id);
            }}
          />
        </View>
      </View>

      <Eyebrow style={style.repeatLabel}>{L10N.SCHEDULED_FREQUENCY}</Eyebrow>
      <SegmentedToggle
        options={kindOptions}
        style={style.section}
        value={kind}
        onChange={(nextValue) => setKind(nextValue)}
      />

      {kind === 'weekly' ? (
        <View row style={style.dayRow}>
          {Array.from({ length: 7 }).map((_, d) => {
            const selected = (byWeekday || []).includes(d);
            return (
              <Pressable
                key={`dow-${d}`}
                onPress={() => toggleDay(d)}
                style={[style.dayChip, selected && style.dayChipSelected]}
              >
                <Text align="center" bold={selected} medium={!selected} size="s" tone={selected ? 'onAccent' : 'muted'}>
                  {weekdayInitial(d, language)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <View style={style.group}>
          <FieldRow chevron label={L10N.DATE} onPress={() => setOpenDate(true)}>
            <Text medium size="s">
              {verboseDate(new Date(startAt), { locale, day: 'numeric', month: 'short', year: 'numeric' })}
            </Text>
          </FieldRow>
        </View>
      )}

      {openDate ? (
        <Modal onClose={() => setOpenDate(false)}>
          <DateTimePicker
            accentColor={colors.accent}
            is24Hour
            minimumDate={new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
            textColor={colors.text}
            themeVariant={themeMode}
            value={new Date(startAt)}
            onChange={(event, nextDate) => {
              if (!nextDate) return;
              setStartAt(nextDate.getTime());
              setByMonthDay(nextDate.getDate());
              setOpenDate(false);
            }}
          />
        </Modal>
      ) : null}

      {Number.isFinite(previewNextAt) ? (
        <View row style={style.preview}>
          <Text flex size="s" tone="muted">
            {`${previewCaption} \u00B7 ${verboseDate(new Date(previewNextAt), {
              locale: language,
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            })}`}
          </Text>
        </View>
      ) : null}

      <View row style={style.footer}>
        {existing?.id ? (
          <Button variant="dangerSoft" onPress={handleDelete} grow>
            {L10N.DELETE}
          </Button>
        ) : null}
        <Button disabled={!valid} onPress={handleSave} grow>
          {L10N.SAVE}
        </Button>
      </View>
    </Panel>
  );
};

ScheduledForm.displayName = 'ScheduledForm';

ScheduledForm.propTypes = {
  navigation: PropTypes.any,
  route: PropTypes.any,
};

export { ScheduledForm };
