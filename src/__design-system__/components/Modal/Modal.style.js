import StyleSheet from 'react-native-extended-stylesheet';

import { colorOpacity } from '../../../modules';

export const style = StyleSheet.create({
  overflow: {
    backgroundColor: () => colorOpacity(StyleSheet.value('$colorBase'), 0.66),
    flex: 1,
    justifyContent: 'flex-end',
  },

  safeAreaView: {
    backgroundColor: '$colorBase',
    borderColor: '$colorBorder',
    borderTopWidth: 1,
  },

  pressableClose: {
    alignItems: 'center',
    paddingTop: '$spaceS',
    paddingBottom: '$spaceXS',
    width: '100%',
  },

  content: {
    paddingHorizontal: '$spaceM',
    paddingBottom: '$spaceM',
  },
});
