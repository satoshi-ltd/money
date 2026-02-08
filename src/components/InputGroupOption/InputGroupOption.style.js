import { StyleSheet } from 'react-native';

import { inputPaddingHorizontal, inputPaddingVertical } from '../../theme/layout';

export const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: inputPaddingHorizontal,
    paddingVertical: inputPaddingVertical,
  },
  group: {
    alignSelf: 'center',
  },
});
