import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  amounts: {
    alignItems: 'flex-end',
    flex: 1,
  },

  container: {
    alignItems: 'center',
    backgroundColor: '$colorBase',
    borderColor: '$colorBorder',
    borderStyle: '$borderStyle',
    borderRadius: '$borderRadius',
    borderWidth: '$borderWidth',
    flexDirection: 'row',
    gap: '$spaceS',
    justifyContent: 'center',
    height: '$inputHeight',
    paddingBottom: '$fontInputPaddingBottom',
    paddingLeft: '$fontInputPaddingLeft',
    paddingRight: '$fontInputPaddingRight',
    paddingTop: '$fontInputPaddingTop',
    width: '100%',
  },

  focus: {
    borderColor: '$colorContentLight',
    zIndex: 1,
  },

  input: {
    fontFamily: '$fontInput',
    fontSize: '$fontInputSize',
    height: '$inputHeight',
    opacity: 0,
    paddingLeft: '$fontInputPaddingLeft',
    paddingRight: '$fontInputPaddingRight + $spaceM',
    position: 'absolute',
    right: 0,
    textAlign: 'right',
    top: 0,
    width: '100%',
    zIndex: 1,
  },

  currentBalance: {
    alignContent: 'center',
    flexDirection: 'row',
    gap: '$spaceXXS',
    marginTop: '$spaceXXS',
  },
});
