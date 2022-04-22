import TriggerForm from './TriggerForm';
import renderer from 'react-test-renderer';

it('should render', () => {
  const trigger = {
    events: ['foo'],
  };
  const onChange = jest.fn();
  const root = renderer.create(
    <TriggerForm trigger={trigger} onChange={onChange} />
  );
  expect(root.toJSON()).toMatchSnapshot();
});
