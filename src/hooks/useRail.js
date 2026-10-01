import { createContext, useContext } from 'react';
import { useWindowDimensions } from 'react-native';

import { railBreakpoint } from '../theme/layout';

const RailContext = createContext(false);

export const RailProvider = RailContext.Provider;
export const railFits = (width) => width >= railBreakpoint;
export const useRail = () => useContext(RailContext);
export const useRailFits = () => railFits(useWindowDimensions().width);
