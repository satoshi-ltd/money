import StyleSheet from 'react-native-extended-stylesheet';

export const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  sheet: {
    borderTopLeftRadius: '$borderRadius',
    borderTopRightRadius: '$borderRadius',
    overflow: 'hidden',
    backgroundColor: '$colorBase',
    maxHeight: '90%',
  },
  handle: {
    alignSelf: 'center',
    width: '$spaceXL',
    height: 4,
    borderRadius: 2,
    backgroundColor: '$colorBorder',
    marginTop: '$spaceS',
    marginBottom: '$spaceXS',
  },
  container: {
    paddingHorizontal: '$viewOffset',
    paddingBottom: '$viewOffset',
    alignSelf: 'stretch',
  },
  scrollContent: {
    paddingBottom: '$viewOffset',
  },
  gap: {
    gap: '$viewOffset',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '$viewOffset',
  },
  title: {
    flex: 1,
  },
  close: {
    padding: '$spaceXS',
  },
});
