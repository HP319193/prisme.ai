import Inline from './Inline';
import renderer, { act } from 'react-test-renderer';
import CodeEditor from './CodeEditor';

jest.mock('./CodeEditor', () => {
  const { Component } = require('react');
  return class CodeEditor extends Component {
    editor = {
      container: {
        querySelector: () => {
          return {
            getBoundingClientRect: () => ({
              height: 42,
            }),
          };
        },
      },
    };
    render() {
      return null;
    }
  };
});

it('should render', () => {
  const root = renderer.create(<Inline value="hello world" mode="json" />);
  expect(root.toJSON()).toMatchSnapshot();
});

it('should get line height', () => {
  const root = renderer.create(<Inline value="hello world" mode="json" />);
  act(() => {
    return;
  });
  expect(root.root.findByType(CodeEditor).props.style.minHeight).toBe('50px');
});
