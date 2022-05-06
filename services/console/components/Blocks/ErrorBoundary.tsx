import { Component } from 'react';

export class ErrorBoundary extends Component {
  state = {
    hasError: null,
  };
  static getDerivedStateFromError(error: any) {
    console.error(error);
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
