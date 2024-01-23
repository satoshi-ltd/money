import { Platform } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  container: {
    backgroundColor: '$colorBase',
    borderColor: '$colorBorder',
    borderStyle: '$borderStyle',
    borderRadius: '$borderRadius',
    borderWidth: '$borderWidth',
    height: '$inputHeight',
  },

  focus: {
    borderColor: '$colorContentLight',
    zIndex: 1,
  },

  input: {
    color: '$colorContent',
    flex: 0,
    fontFamily: '$fontInput',
    fontSize: '$fontInputSize',
    height: '$inputHeight',
    margin: 0,
    minHeight: '$inputHeight',
    paddingTop: '$fontInputPaddingTop + $spaceS',
    paddingRight: '$fontInputPaddingRight',
    paddingBottom: '$fontInputPaddingBottom',
    paddingLeft: '$fontInputPaddingLeft',
    textAlignVertical: 'center',
    ...Platform.select({
      web: {
        outlineWidth: 0,
      },
    }),
    width: '100%',
  },

  label: {
    position: 'absolute',
    top: '$spaceM - $spaceXS',
    left: '$fontInputPaddingLeft',
  },
});
