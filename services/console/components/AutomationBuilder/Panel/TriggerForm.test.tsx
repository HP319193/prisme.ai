import TriggerForm from './TriggerForm';
import renderer from 'react-test-renderer';

it('should render', () => {
  const trigger = {
    events: ['foo'],
  };
  const onSubmit = jest.fn();
  const root = renderer.create(
    <TriggerForm trigger={trigger} onSubmit={onSubmit} />
  );
  expect(root.toJSON()).toMatchSnapshot();
});
