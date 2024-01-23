import PropTypes from 'prop-types';
import React, { useEffect, useRef } from 'react';
import { useWindowDimensions } from 'react-native';

import { getLastMonths } from './modules';
import { style } from './SliderMonths.style';
import { ScrollView } from '../../../../../__design-system__';
import { Option, OPTION_SIZE } from '../../../../../components';
import { C, L10N } from '../../../../../modules';

const { STATS_MONTHS_LIMIT } = C;

const SliderMonths = ({ index, onChange, ...others }) => {
  const scrollViewRef = useRef(null);
  const { width } = useWindowDimensions();

  useEffect(() => {
    scrollViewRef.current?.scrollTo({ x: (index - 1) * OPTION_SIZE });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const months = getLastMonths(STATS_MONTHS_LIMIT);

  return (
    <ScrollView horizontal ref={scrollViewRef} snap={OPTION_SIZE} width={width} style={[style.slider, others.style]}>
      {months.map(({ month, year }, i) => (
        <Option
          key={`${month}-${year}`}
          caption={L10N.MONTHS[month].substr(0, 3).toUpperCase()}
          highlight={index === i}
          legend={year.toString()}
          onPress={() => onChange({ index: i, month, year })}
          style={[
            //
            style.option,
            i === 0 && style.firstCard,
            i === months.length - 1 && style.lastCard,
          ]}
        />
      ))}
    </ScrollView>
  );
};

SliderMonths.propTypes = {
  index: PropTypes.number,
  onChange: PropTypes.func,
};

export { SliderMonths };
