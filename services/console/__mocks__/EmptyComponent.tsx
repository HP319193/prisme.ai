import { Component } from 'react';

export class EmptyComponent extends Component {
  render() {
    return this.props.children;
  }
}

export default EmptyComponent;
