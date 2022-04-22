import ConditionForm from './ConditionForm';
import renderer, { act } from 'react-test-renderer';
import { SchemaForm } from '@prisme.ai/design-system';

it('should render', () => {
  const onChange = jest.fn();
  const root = renderer.create(<ConditionForm onChange={onChange} />);
  expect(root.toJSON()).toMatchSnapshot();
});

it('should submit', () => {
  const onChange = jest.fn();
  const root = renderer.create(<ConditionForm onChange={onChange} />);
  act(() => {
    root.root.findByType(SchemaForm).props.onChange({
      condition: '$a == 1',
    });
  });
  expect(onChange).toHaveBeenCalledWith({ condition: '$a == 1' });
});
