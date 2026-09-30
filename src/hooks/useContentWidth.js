import { useWindowDimensions } from 'react-native';

import { columnWidth, viewOffset } from '../theme/layout';

export const useContentWidth = () => Math.min(useWindowDimensions().width, columnWidth) - viewOffset * 2;
