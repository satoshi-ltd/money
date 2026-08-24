import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

const CLOSED = { height: 0, top: 0 };

export const useKeyboardInset = () => {
  const [keyboard, setKeyboard] = useState(CLOSED);

  useEffect(() => {
    if (Platform.OS !== 'android') return undefined;

    const show = Keyboard.addListener('keyboardDidShow', ({ endCoordinates } = {}) => {
      const height = Number(endCoordinates?.height);
      if (!Number.isFinite(height) || height <= 0) return;

      const top = Number(endCoordinates?.screenY);
      setKeyboard({ height, top: Number.isFinite(top) && top > 0 ? top : 0 });
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboard(CLOSED));

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return keyboard;
};
