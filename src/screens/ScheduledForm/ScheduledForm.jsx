import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, InteractionManager, useWindowDimensions } from 'react-native';

import { style } from './ScheduledForm.style';
import {
  Button,
  CardOption,
  Field,
  Heading,
  InputAccount,
  InputAmount,
  InputDate,
  InputField,
  InputGroupOption,
  Panel,
  Pressable,
  ScrollView,
  Text,
  View,
} from '../../components';
import { useApp, useStore } from '../../contexts';
import { C, getIcon, L10N } from '../../modules';
import { optionSnap } from '../../theme/layout';
import { queryCategories } from '../Transaction/helpers/queryCategories';

const {
  TX: {
    TYPE: { EXPENSE, INCOME },
  },
} = C;

const weekdayLabel = (day) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day] || '?';

const ScheduledForm = ({ navigation = {}, route = {} }) => {
  const { goBack } = navigation;
  const { params: { id } = {} } = route;
  const { colors } = useApp();
  const { width } = useWindowDimensions();
  const scrollRef = useRef(null);

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

  useEffect(() => {
    const index = categories.findIndex(({ key }) => key === category);
    if (index < 0) return;

    const x = Math.max(0, (index - 1) * optionSnap);
    let cancelled = false;
    const task = InteractionManager.runAfterInteractions(() => {
      if (cancelled) return;
      requestAnimationFrame(() => {
        if (cancelled) return;
        scrollRef.current?.scrollTo({ x, animated: true });
      });
    });

    return () => {
      cancelled = true;
      task?.cancel?.();
    };
  }, [categories, category]);

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
    Alert.alert(L10N.CONFIRM_DELETION, L10N.CONFIRM_DELETION_CAPTION, [
      { text: L10N.CANCEL, style: 'cancel' },
      {
        text: L10N.DELETE,
        style: 'destructive',
        onPress: async () => {
          await deleteScheduled({ id: existing.id });
          goBack();
        },
      },
    ]);
  };

  return (
    <Panel offset title={existing ? L10N.SCHEDULED_EDIT : L10N.SCHEDULED_NEW} onBack={goBack}>
      <View style={style.section}>
        <Heading value={L10N.CATEGORY} />
        <ScrollView horizontal ref={scrollRef} snapTo={optionSnap} style={[{ width }, style.categoryScroll]}>
          {categories.map((item, index) => (
            <CardOption
              key={item.key}
              highlight={category === item.key}
              icon={getIcon({ type, category: item.key })}
              legend={item.caption}
              onPress={() => setCategory(item.key)}
              style={[style.option, index === categories.length - 1 ? { marginRight: 0 } : null]}
            />
          ))}
        </ScrollView>
      </View>

      <Heading value={L10N.DETAILS} />

      <InputGroupOption
        first
        label={L10N.TYPE}
        options={typeOptions}
        value={type}
        onChange={(nextValue) => setType(nextValue)}
      />

      <InputAccount accounts={accounts} onSelect={(a) => setAccount(a.hash)} selected={currentAccount} />

      <InputAmount account={currentAccount} currency={currentAccount?.currency} value={value} onChange={setValue} />

      <InputField label={L10N.CONCEPT} value={title} onChange={setTitle} />

      <InputGroupOption
        label={L10N.SCHEDULED_FREQUENCY}
        options={kindOptions}
        value={kind}
        onChange={(nextValue) => setKind(nextValue)}
      />

      {kind === 'weekly' ? (
        <Field last style={style.dayField}>
          <View style={[style.dayRow, { backgroundColor: colors.surface }]}>
            {Array.from({ length: 7 }).map((_, d) => {
              const selected = (byWeekday || []).includes(d);
              return (
                <Pressable
                  key={`dow-${d}`}
                  onPress={() => toggleDay(d)}
                  style={[
                    style.dayChip,
                    {
                      backgroundColor: selected ? colors.accent : 'transparent',
                    },
                  ]}
                >
                  <Text align="center" bold size="s" tone={selected ? 'onAccent' : 'secondary'}>
                    {weekdayLabel(d)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Field>
      ) : (
        <InputDate
          last
          label={L10N.DATE}
          minimumDate={new Date()}
          value={new Date(startAt)}
          onChange={(value) => {
            setStartAt(value.getTime());
            setByMonthDay(value.getDate());
          }}
        />
      )}

      <View row style={style.footer}>
        {existing?.id ? (
          <Button variant="outlined" onPress={handleDelete} grow>
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
