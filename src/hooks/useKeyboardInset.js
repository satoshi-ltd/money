import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

export const useKeyboardInset = () => {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    if (Platform.OS !== 'android') return undefined;

    const show = Keyboard.addListener('keyboardDidShow', ({ endCoordinates } = {}) => {
      const height = Number(endCoordinates?.height);
      setInset(Number.isFinite(height) && height > 0 ? height : 0);
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => setInset(0));

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return inset;
};
