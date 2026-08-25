import PropTypes from 'prop-types';
import React from 'react';

import { Heading, Mark, Text, View } from '../../components';
import { L10N } from '../../modules';

const CLAIMS = [1, 2, 3, 4];

const Cover = ({ style }) => (
  <>
    <View style={[style.pad, style.coverTop]}>
      <Mark size={56} />
      <Text bold size="xxl" style={style.headline}>
        {L10N.ONB_COVER_TITLE}
      </Text>
      <Text size="s" tone="secondary" style={style.caption}>
        {L10N.ONB_COVER_CAPTION}
      </Text>
    </View>

    <View style={[style.pad, style.claims]}>
      <Heading eyebrow={L10N.ONB_COVER_HEADING_EYEBROW} value={L10N.ONB_COVER_HEADING} />
      {CLAIMS.map((index) => (
        <View key={index} row style={[style.claim, index > 1 && style.claimDivider]}>
          <Text figure="xs" tone="muted" style={style.claimIndex}>
            {`0${index}`}
          </Text>
          <View flex>
            <Text medium>{L10N[`ONB_CLAIM_${index}`]}</Text>
            <Text size="xs" tone="muted">
              {L10N[`ONB_CLAIM_${index}_CAPTION`]}
            </Text>
          </View>
        </View>
      ))}
    </View>
  </>
);

Cover.propTypes = {
  style: PropTypes.object.isRequired,
};

export { Cover };
