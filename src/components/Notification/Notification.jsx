import React, { useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { getStyles } from './Notification.style';
import { useApp } from '../../contexts';
import { C, eventEmitter, ICON, L10N } from '../../modules';
import { Icon, Pressable, Text, View } from '../../primitives';

const { EVENT } = C;

const NotificationBase = ({ error, onClose, text, title, visible, style: containerStyle }) => {
  if (!visible) return null;

  const { colors } = useApp();
  const style = useMemo(() => getStyles(colors), [colors]);
  const contentTone = error ? 'onInverse' : 'onAccent';

  return (
    <Pressable onPress={onClose} style={[style.notification, error ? style.alert : style.accent, containerStyle]}>
      <SafeAreaView edges={['top']} style={style.safeAreaView}>
        <Icon name={error ? ICON.ALERT : ICON.INFO} tone={contentTone} />
        <View flex style={style.text}>
          <Text bold tone={contentTone}>
            {title}
          </Text>
          {text ? (
            <Text tone={contentTone} size="xs">
              {text}
            </Text>
          ) : null}
        </View>
        <Pressable onPress={onClose}>
          <Icon name={ICON.CLOSE} tone={contentTone} />
        </Pressable>
      </SafeAreaView>
    </Pressable>
  );
};

export const Notification = () => {
  const { top } = useSafeAreaInsets();

  const [value, setValue] = useState();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const listener = (data = {}) => {
      if (visible) setVisible(false);
      setTimeout(
        () => {
          setValue(data);
          setVisible(true);

          if (!data.error) setTimeout(() => setVisible(false), 5000);
        },
        visible ? 300 : 0,
      );
    };

    eventEmitter.on(EVENT.NOTIFICATION, listener);
    return () => eventEmitter.off(EVENT.NOTIFICATION, listener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => setVisible(false);

  const { error, text, title } = value || {};

  return (
    <NotificationBase
      {...{ error, text, visible }}
      title={title || (error ? L10N.ERROR : L10N.INFO)}
      onClose={handleClose}
      style={Platform.OS === 'android' ? { marginTop: top } : undefined}
    />
  );
};
