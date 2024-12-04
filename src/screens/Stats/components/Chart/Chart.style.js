import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  $barSize: '$spaceS * 1.25',
  $barRadius: '$barSize / 2',

  bars: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: '$barSize * 8',
  },

  bar: {
    backgroundColor: '$colorBorder',
    borderTopLeftRadius: '$barRadius',
    borderTopRightRadius: '$barRadius',
    maxHeight: '100%',
    minHeight: '$barSize',
    width: '$barSize',
  },

  border: {
    borderColor: '$colorBorder',
    borderTopWidth: 1,
  },

  offset: {
    marginHorizontal: '$spaceM',
  },

  barInverted: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: '$barRadius',
    borderBottomRightRadius: '$barRadius',
  },

  captions: {
    borderColor: '$colorBorder',
    borderTopWidth: 1,
    flexDirection: 'row',
    paddingTop: '$spaceXXS',
  },

  caption: {
    flex: 1,
  },

  column: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },

  columnInverted: {
    justifyContent: 'flex-start',
  },

  scales: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 1,
  },

  scaleAvg: {
    marginTop: '$spaceS * -1',
    top: '100%',
  },

  scaleLine: {
    borderColor: '$colorContentLight',
    borderStyle: 'dashed',
    borderWidth: 0.5,
    height: 0.5,
    opacity: 0.5,
    top: '50%',
    width: '100%',
  },

  scaleLineAccent: {
    borderColor: '$colorAccent',
  },

  tag: {
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: '$borderRadius / 2',
    paddingHorizontal: '$spaceXS',
    paddingVertical: '$spaceXS / 4',
  },

  scaleBorder: {
    borderColor: '$colorBase',
    borderWidth: 1,
    margin: 1,
  },

  // colors
  accent: {
    backgroundColor: '$colorAccent',
  },

  content: {
    backgroundColor: '$colorContent',
  },
});
