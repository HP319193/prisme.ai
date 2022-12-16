import TriggerForm from './TriggerForm';
import renderer from 'react-test-renderer';
import { workspaceContext } from '../../../providers/Workspace';

it('should render', () => {
  const trigger = {
    events: ['foo'],
  };
  const onChange = jest.fn();
  const root = renderer.create(
    <workspaceContext.Provider value={{ workspace: { imports: {} } } as any}>
      <TriggerForm trigger={trigger} onChange={onChange} />
    </workspaceContext.Provider>
  );
  expect(root.toJSON()).toMatchSnapshot();
});
