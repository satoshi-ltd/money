import PropTypes from 'prop-types';
import React, { useEffect, useRef } from 'react';
import { useWindowDimensions } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

import { getLastMonths } from './modules';
import { style } from './SliderMonths.style';
import { ScrollView } from '../../../../../__design-system__';
import { Option } from '../../../../../components';
import { C, L10N } from '../../../../../modules';

const { STATS_MONTHS_LIMIT } = C;

const SliderMonths = ({ index, onChange }) => {
  const scrollview = useRef(null);
  const { width } = useWindowDimensions();

  useEffect(() => {
    scrollview.current?.scrollTo({ x: (index - 1) * optionSnap, animated: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const months = getLastMonths(STATS_MONTHS_LIMIT);
  const optionSnap = StyleSheet.value('$optionSnap');

  return (
    <ScrollView horizontal ref={scrollview} snap={optionSnap} width={width} style={style.scrollView}>
      {months.map(({ month, year }, i) => (
        <Option
          key={`${month}-${year}`}
          caption={L10N.MONTHS[month].substring(0, 3).toUpperCase()}
          highlight={index === i}
          legend={year.toString()}
          onPress={() => onChange({ index: i, month, year })}
          style={[style.option, i === 0 && style.firstOption, i === months.length - 1 && style.lastOption]}
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
