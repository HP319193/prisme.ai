import Workspaces from './Workspaces';
import renderer, { act } from 'react-test-renderer';
import { useWorkspaces } from '../components/WorkspacesProvider';
import { useRouter } from 'next/router';
import { Card } from 'antd';

jest.mock('../components/WorkspacesProvider', () => {
  const workspaces = new Map();
  const create = jest.fn(() => ({
    id: '43',
  }));

  return {
    useWorkspaces: () => ({
      workspaces,
      create,
    }),
  };
});
jest.mock('next/router', () => {
  const push = jest.fn();
  return {
    useRouter: () => ({
      push,
    }),
  };
});

beforeEach(() => {
  useWorkspaces().workspaces.clear();
});

it('should render empty', () => {
  const root = renderer.create(<Workspaces />);
  expect(root.toJSON()).toMatchSnapshot();
});

it('should render some workspaces', () => {
  useWorkspaces().workspaces.set('1', {
    id: '1',
    name: 'foo',
    automations: {},
    createdAt: '2021-12-15',
    updatedAt: '2021-12-15',
  });
  useWorkspaces().workspaces.set('42', {
    id: '42',
    name: 'bar',
    automations: {},
    createdAt: '2021-12-15',
    updatedAt: '2021-12-15',
  });
  const root = renderer.create(<Workspaces />);
  expect(root.toJSON()).toMatchSnapshot();
});

it('should create new workspace', async () => {
  const root = renderer.create(<Workspaces />);
  await act(async () => {
    await root.root.findByType(Card).props.actions[0].props.onClick();
  });
  expect(useWorkspaces().create).toHaveBeenCalledWith('create.defaultName');
  expect(useRouter().push).toHaveBeenCalledWith('/workspaces/43');
});
