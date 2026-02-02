import StyleSheet from 'react-native-extended-stylesheet';

const COLOR_TOKENS = {
  base: '$colorBase',
  content: '$colorContent',
  contentLight: '$colorContentLight',
  border: '$colorBorder',
  accent: '$colorAccent',
  error: '$colorError',
};

export const resolveColor = (color, fallback) => {
  if (!color) return fallback;
  const token = COLOR_TOKENS[color];
  return token ? StyleSheet.value(token) : color;
};
