import PropTypes from 'prop-types';
import React from 'react';

import { Fallback } from './Fallback';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: undefined };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    this.props.onError?.(error);
  }

  render() {
    const { error } = this.state;

    return error ? <Fallback error={error} onRetry={() => this.setState({ error: undefined })} /> : this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node,
  onError: PropTypes.func,
};

export default ErrorBoundary;
