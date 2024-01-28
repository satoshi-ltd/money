import StyleSheet from 'react-native-extended-stylesheet';

import { opacity } from '../../../../../__design-system__/theme/modules';

export const style = StyleSheet.create({
  $barRadius: '$spaceS / 2',
  $barSize: '$spaceS',

  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
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
    // zIndex: 2,
  },

  border: {
    borderColor: '$colorBorder',
    borderTopWidth: 1,
  },

  offset: {
    marginHorizontal: '$spaceM',
    // zIndex: 1,
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
    justifyContent: 'space-between',
    paddingTop: '$spaceXXS',
    paddingLeft: '$spaceXS',
    paddingRight: '$spaceXS',
  },

  column: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    overflow: 'hidden',
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
    borderStyle: 'dotted',
    borderWidth: 1,
    borderRadius: 1,
    height: 0,
    width: '100%',
    top: '50%',
    opacity: 0.5,
  },

  scaleLineAccent: {
    borderColor: '$colorAccent',
  },

  tag: {
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: '$borderRadius',
    paddingHorizontal: '$spaceXS',
  },

  scaleBorder: {
    borderColor: () => opacity(StyleSheet.value('$colorBase'), 0.75),
    borderWidth: '$borderWidth',
    margin: '$borderWidth',
  },

  // colors
  accent: {
    backgroundColor: '$colorAccent',
  },

  content: {
    backgroundColor: '$colorContent',
  },
});
