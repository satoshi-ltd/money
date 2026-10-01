import PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';

import { getStyles } from './DatePicker.styles';
import { useApp } from '../../contexts';
import {
  composeDate,
  dayAllowed,
  dayKey,
  dayStart,
  ICON,
  L10N,
  monthWeeks,
  weekdayOrder,
  weekStartFor,
} from '../../modules';
import { Button, Icon, Pressable, Text, View } from '../../primitives';
import Modal from '../Modal';

const DAY_NAME = { day: 'numeric', month: 'long', weekday: 'long', year: 'numeric' };

const DatePicker = ({ maximumDate, minimumDate, onClose, onSelect, value }) => {
  const { colors, formatDate, language } = useApp();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const [view, setView] = useState({ month: value.getMonth(), year: value.getFullYear() });
  const [picked, setPicked] = useState(() => dayStart(value));

  const today = new Date();
  const weekStart = weekStartFor(language);
  const weeks = useMemo(() => monthWeeks({ ...view, weekStart }), [view, weekStart]);
  const allowed = (date) => dayAllowed({ date, maximumDate, minimumDate });
  const monthOf = (date) => date.getFullYear() * 12 + date.getMonth();
  const canGoBack = !minimumDate || monthOf(minimumDate) < view.year * 12 + view.month;
  const canGoForward = !maximumDate || monthOf(maximumDate) > view.year * 12 + view.month;

  const shift = (step) => {
    const next = new Date(view.year, view.month + step, 1);
    setView({ month: next.getMonth(), year: next.getFullYear() });
  };

  const handleAccept = () => {
    onSelect(composeDate({ day: picked, maximumDate, minimumDate, time: value }));
    onClose();
  };

  const renderStep = (step, icon, label, enabled) => (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled: !enabled }}
      disabled={!enabled}
      onPress={() => shift(step)}
      style={[styles.step, !enabled && styles.stepOff]}
    >
      <Icon name={icon} size="s" tone="muted" />
    </Pressable>
  );

  return (
    <Modal onClose={onClose}>
      <View style={styles.header}>
        {renderStep(-1, ICON.BACK, L10N.A11Y_PREVIOUS_MONTH, canGoBack)}
        <Text accessibilityLiveRegion="polite" accessibilityRole="header" medium>{`${L10N.MONTHS[view.month]} ${view.year}`}</Text>
        {renderStep(1, ICON.RIGHT, L10N.A11Y_NEXT_MONTH, canGoForward)}
      </View>

      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.weekdays}>
        {weekdayOrder(weekStart).map((weekday) => (
          <Text key={weekday} align="center" size="xs" style={styles.weekday} tone="muted">
            {formatDate(new Date(2023, 0, 1 + weekday), { weekday: 'narrow' })}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {weeks.map((week, row) => (
          <View key={`week-${row}`} style={styles.week}>
            {week.map((day, column) => {
              if (!day) return <View key={`blank-${column}`} style={styles.cell} />;

              const date = new Date(view.year, view.month, day);
              const enabled = allowed(date);
              const chosen = dayKey(date) === dayKey(picked);
              const current = dayKey(date) === dayKey(today);

              return (
                <Pressable
                  key={`day-${day}`}
                  accessibilityLabel={formatDate(date, DAY_NAME)}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: !enabled, selected: chosen }}
                  disabled={!enabled}
                  onPress={() => setPicked(date)}
                  style={[styles.cell, styles.day, current && styles.dayToday, chosen && styles.dayChosen, !enabled && styles.dayOff]}
                >
                  <Text figure="sm" tone={chosen ? 'onAccent' : enabled ? 'primary' : 'muted'}>
                    {day}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <Button grow variant="outlined" onPress={onClose}>
          {L10N.CANCEL}
        </Button>
        <Button disabled={!allowed(picked)} grow onPress={handleAccept}>
          {L10N.ACCEPT}
        </Button>
      </View>
    </Modal>
  );
};

DatePicker.propTypes = {
  maximumDate: PropTypes.instanceOf(Date),
  minimumDate: PropTypes.instanceOf(Date),
  onClose: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  value: PropTypes.instanceOf(Date).isRequired,
};

export { DatePicker };
