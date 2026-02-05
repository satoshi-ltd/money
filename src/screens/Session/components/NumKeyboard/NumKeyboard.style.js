import { StyleSheet } from 'react-native';

import { theme } from '../../../../theme';

export const style = StyleSheet.create({
  container: {
    flex: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },

  pressable: {
    width: '33.3%',
  },

  key: {
    alignItems: 'center',
    marginVertical: theme.spacing.sm,
  },
});
