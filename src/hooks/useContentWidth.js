import { useWindowDimensions } from 'react-native';

import { useRail } from './useRail';
import { columnWidth, railWidth, viewOffset } from '../theme/layout';

export const useContentWidth = () => {
  const { width } = useWindowDimensions();
  const rail = useRail();

  return (rail ? width - railWidth : Math.min(width, columnWidth)) - viewOffset * 2;
};
