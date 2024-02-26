import { Dimensions } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

const { width } = Dimensions.get('window');

export const style = StyleSheet.create({
  banner: {
    gap: '$spaceL',
    maxWidth: width * 0.8,
    padding: '$spaceXL',
    width: width * 0.8,
  },

  left: {
    alignItems: 'flex-start',
    alignSelf: 'flex-start',
  },

  center: {
    alignItems: 'center',
    alignSelf: 'center',
  },

  right: {
    alignItems: 'flex-end',
    alignSelf: 'flex-end',
  },

  image: {
    height: 304,
    minHeight: 304,
    width: 176,
    minWidth: 176,
    marginBottom: '$spaceM',
  },
});
