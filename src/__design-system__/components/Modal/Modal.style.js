import StyleSheet from 'react-native-extended-stylesheet';

import { opacity } from '../../theme/modules';

export const style = StyleSheet.create({
  overflow: {
    backgroundColor: () => opacity(StyleSheet.value('$modalOverflowBackgroundColor'), 0.66),
    flex: 1,
    justifyContent: 'flex-end',
  },

  safeAreaView: {
    backgroundColor: '$colorBase',
    borderColor: '$colorBorder',
    borderTopWidth: 1,
  },

  fullscreen: {
    borderTopWidth: 0,
    flex: 1,
  },

  pressableClose: {
    alignItems: 'center',
    paddingTop: '$spaceS',
    paddingBottom: '$spaceXS',
    width: '100%',
  },

  content: {
    padding: '$spaceM',
  },

  contentModal: {
    paddingTop: 0,
  },
});
