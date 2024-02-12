import { Text, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React from 'react';
import { Image } from 'react-native';

import { style } from './Banner.style';

const DEFAULT_BANNER = require('../../../assets/images/not-found.png');

const Banner = ({ align = 'center', caption, image = DEFAULT_BANNER, title, ...others }) => (
  <View style={[style.banner, style[align], others.style]}>
    <Image resizeMode="contain" source={image} style={style.image} />
    {title && (
      <Text align={align} bold title>
        {title}
      </Text>
    )}
    {caption && (
      <Text align={align} color="contentLight">
        {caption}
      </Text>
    )}
  </View>
);

Banner.displayName = 'Components.Banner';

Banner.propTypes = {
  align: PropTypes.oneOf(['left', 'center', 'right']),
  caption: PropTypes.string,
  image: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  title: PropTypes.string,
};

export { Banner };
