import EditableTitle from './EditableTitle';
import renderer, { act } from 'react-test-renderer';
import { InputText } from 'primereact/inputtext';
// @ts-ignore because its a mock
import { close } from 'primereact/inplace';

jest.mock('primereact/inplace', () => {
  const EmptyComponent = require('../__mocks__/EmptyComponent').default;

  const close = jest.fn();
  class Inplace extends EmptyComponent {
    close = close;
  }
  return {
    Inplace,
    InplaceDisplay: EmptyComponent,
    InplaceContent: EmptyComponent,
    close,
  };
});

it('should render', () => {
  const onChange = jest.fn();
  const root = renderer.create(
    <EditableTitle title="foo" onChange={onChange} />
  );
  expect(root.toJSON()).toMatchSnapshot();
});

it('should change value on Enter', () => {
  const onChange = jest.fn();
  const root = renderer.create(
    <EditableTitle title="foo" onChange={onChange} />
  );
  act(() => {
    root.root
      .findByType(InputText)
      .props.onChange({ target: { value: 'foo' } });
    root.root.findByType(InputText).props.onKeyDown({ key: 'Enter' });
  });
  expect(onChange).toHaveBeenCalledWith('foo');
  expect(close).toHaveBeenCalled();
});

it('should change value on Blur', () => {
  const onChange = jest.fn();
  const root = renderer.create(
    <EditableTitle title="foo" onChange={onChange} />
  );
  act(() => {
    root.root
      .findByType(InputText)
      .props.onChange({ target: { value: 'foo' } });
    root.root.findByType(InputText).props.onBlur();
  });
  expect(onChange).toHaveBeenCalledWith('foo');
  expect(close).toHaveBeenCalled();
});

it('should not change value if empty', () => {
  const onChange = jest.fn();
  const root = renderer.create(
    <EditableTitle title="foo" onChange={onChange} />
  );
  act(() => {
    root.root.findByType(InputText).props.onChange({ target: { value: '' } });
  });
  act(() => {
    root.root.findByType(InputText).props.onBlur();
  });
  expect(onChange).not.toHaveBeenCalled();
});
