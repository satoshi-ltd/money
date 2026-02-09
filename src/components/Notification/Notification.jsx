import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getStyles } from './Notification.style';
import { useApp } from '../../contexts';
import { C, eventEmitter, ICON, L10N } from '../../modules';
import { Icon, Pressable, Text, View } from '../../primitives';
import { theme } from '../../theme';

const { EVENT } = C;

export const Notification = () => {
  const { top } = useSafeAreaInsets();
  const { colors } = useApp();
  const style = useMemo(() => getStyles(colors), [colors]);

  const [value, setValue] = useState();
  const [rendered, setRendered] = useState(false);
  const isVisibleRef = useRef(false);
  const anim = useRef(new Animated.Value(0)).current;
  const dismissTimerRef = useRef();

  useEffect(() => {
    const listener = (data = {}) => {
      const show = () => {
        if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
        setValue(data);
        setRendered(true);
        isVisibleRef.current = true;
        Animated.timing(anim, {
          toValue: 1,
          duration: theme.animations.duration.quick,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();

        if (!data.error) {
          dismissTimerRef.current = setTimeout(() => hide(), 5000);
        }
      };

      const hide = () => {
        if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
        isVisibleRef.current = false;
        Animated.timing(anim, {
          toValue: 0,
          duration: theme.animations.duration.quick,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (!finished) return;
          if (isVisibleRef.current) return;
          setRendered(false);
        });
      };

      if (isVisibleRef.current) {
        // Animate out, swap content, then animate in.
        Animated.timing(anim, {
          toValue: 0,
          duration: Math.max(160, Math.round(theme.animations.duration.quick * 0.7)),
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (!finished) return;
          show();
        });
      } else {
        show();
      }
    };

    eventEmitter.on(EVENT.NOTIFICATION, listener);
    return () => eventEmitter.off(EVENT.NOTIFICATION, listener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(
    () => () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    },
    [],
  );

  const handleClose = () => {
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    isVisibleRef.current = false;
    Animated.timing(anim, {
      toValue: 0,
      duration: theme.animations.duration.quick,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setRendered(false);
    });
  };

  if (!rendered) return null;

  const { error, text, title } = value || {};
  const contentTone = error ? 'onInverse' : 'onAccent';

  const animatedStyle = {
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [-12, 0],
        }),
      },
      {
        scale: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.98, 1],
        }),
      },
    ],
  };

  return (
    <Animated.View
      style={[style.notification, error ? style.alert : style.accent, { top: Math.max(0, top) + theme.spacing.xs }, animatedStyle]}
    >
      <Pressable onPress={handleClose}>
        <View row style={style.row}>
          <Icon name={error ? ICON.ALERT : ICON.INFO} tone={contentTone} />
          <View flex style={style.text}>
            <Text bold tone={contentTone}>
              {title || (error ? L10N.ERROR : L10N.INFO)}
            </Text>
            {text ? (
              <Text tone={contentTone} size="xs">
                {text}
              </Text>
            ) : null}
          </View>
          <Pressable onPress={handleClose}>
            <Icon name={ICON.CLOSE} tone={contentTone} />
          </Pressable>
        </View>
      </Pressable>
    </Animated.View>
  );
};
