import React, { useEffect, useMemo, useState } from 'react';
import { Modal as RNModal } from 'react-native';

import { getStyles } from './Confirm.styles';
import { useApp } from '../../contexts';
import { C, eventEmitter, ICON, L10N } from '../../modules';
import { Button, Icon, Text, View } from '../../primitives';

const { EVENT } = C;

export const Confirm = () => {
  const { colors } = useApp();
  const style = useMemo(() => getStyles(colors), [colors]);

  const [value, setValue] = useState();

  useEffect(() => {
    const listener = (data = {}) => setValue(data);
    eventEmitter.on(EVENT.CONFIRM, listener);
    return () => eventEmitter.off(EVENT.CONFIRM, listener);
  }, []);

  if (!value) return null;

  const { actionLabel = L10N.ACCEPT, cancelLabel = L10N.CANCEL, caption, onAction, title } = value;

  const handleCancel = () => setValue(undefined);

  const handleAction = () => {
    setValue(undefined);
    onAction?.();
  };

  return (
    <RNModal transparent visible animationType="fade" onRequestClose={handleCancel}>
      <View style={style.overlay}>
        <View style={style.dialog}>
          <View style={style.well}>
            <Icon name={ICON.ALERT} size="l" tone="danger" />
          </View>
          <Text bold size="l">
            {title}
          </Text>
          {caption ? (
            <Text align="center" size="s" tone="secondary">
              {caption}
            </Text>
          ) : null}
          <View style={style.actions}>
            <Button grow variant="outlined" onPress={handleCancel}>
              {cancelLabel}
            </Button>
            <Button grow variant="danger" onPress={handleAction}>
              {actionLabel}
            </Button>
          </View>
        </View>
      </View>
    </RNModal>
  );
};
