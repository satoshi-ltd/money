import PropTypes from 'prop-types';
import React from 'react';

import { Confirm as ConfirmBase } from '../../__design-system__';
import { L10N } from '../../modules';

const Confirm = ({ route: { params = {} } = {} }) => (
  <ConfirmBase accept={L10N.ACCEPT} cancel={L10N.CANCEL} {...params} />
);

Confirm.propTypes = {
  route: PropTypes.any,
};

export { Confirm };
