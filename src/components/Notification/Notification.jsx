import { Notification as NotificationBase } from '@satoshi-ltd/nano-design';
import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { C, eventEmitter, L10N } from '../../modules';

const { EVENT } = C;

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
      title={title || (error ? L10N.ERROR : 'Info')}
      onClose={handleClose}
      style={Platform.OS === 'android' ? { marginTop: top } : undefined}
    />
  );
};
